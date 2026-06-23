import UIKit
import CoreText
import CoreGraphics

/// Registers every bundled TTF/OTF font under its filename stem as an additional
/// PostScript name so that `UIFont(name: stemName, size:)` — which React Native
/// uses internally — resolves correctly regardless of the font's internal
/// PostScript name.
///
/// iOS identifies fonts by their PostScript name (NameID 6 in the font's name
/// table). Android identifies fonts by their filename (without extension). When
/// font files use a naming convention different from their PostScript names —
/// e.g. Google Fonts exports "ABeeZee_400Italic.ttf" but the PostScript name is
/// "ABeeZee-Italic" — `fontFamily: 'ABeeZee_400Italic'` works on Android but
/// fails silently on iOS.
///
/// This helper patches the name table in memory (no files are modified) and
/// registers the patched font via CTFontManagerRegisterFontURLs. After
/// this runs, `UIFont(name: "ABeeZee_400Italic", size: 16)` works natively on
/// iOS. No swizzling, no runtime interception.
///
/// Call `FontAliasHelper.setup()` in AppDelegate before React Native starts.
enum FontAliasHelper {

    static func setup() {
        guard let resourcePath = Bundle.main.resourcePath else {
            print("[FontAlias] ERROR: no resource path")
            return
        }

        let allFiles = (try? FileManager.default.contentsOfDirectory(atPath: resourcePath)) ?? []
        let tmpDir = FileManager.default.temporaryDirectory.appendingPathComponent("FontAliases")
        try? FileManager.default.createDirectory(at: tmpDir, withIntermediateDirectories: true)

        var urlsToRegister: [URL] = []

        for file in allFiles {
            let ext = (file as NSString).pathExtension.lowercased()
            guard ext == "ttf" || ext == "otf" else { continue }

            let stem = (file as NSString).deletingPathExtension
            let filePath = (resourcePath as NSString).appendingPathComponent(file)

            guard let fontData = NSData(contentsOfFile: filePath) as Data?,
                  let provider = CGDataProvider(data: fontData as CFData),
                  let cgFont = CGFont(provider),
                  let psNameRef = cgFont.postScriptName else {
                print("[FontAlias] could not read: \(file)")
                continue
            }

            let psName = psNameRef as String
            print("[FontAlias] \(file)  psName='\(psName)'  stem='\(stem)'")

            guard psName != stem else {
                print("[FontAlias] \(stem): already matches, skip")
                continue
            }

            guard let patched = patchFontNames(in: fontData, to: stem) else {
                print("[FontAlias] \(stem): patch failed")
                continue
            }

            let tmpURL = tmpDir.appendingPathComponent(file)
            guard (try? patched.write(to: tmpURL)) != nil else {
                print("[FontAlias] \(stem): temp write failed")
                continue
            }
            print("[FontAlias] \(stem): queued")
            urlsToRegister.append(tmpURL)
        }

        guard !urlsToRegister.isEmpty else {
            print("[FontAlias] nothing to register")
            return
        }

        // nil handler = synchronous: guaranteed complete before this line returns.
        CTFontManagerRegisterFontURLs(urlsToRegister as CFArray, .process, true, nil)

        // verify each alias is now resolvable
        for url in urlsToRegister {
            let stem = url.deletingPathExtension().lastPathComponent
            if let f = UIFont(name: stem, size: 12) {
                print("[FontAlias] verify '\(stem)': ✓ found  familyName='\(f.familyName)'")
            } else {
                print("[FontAlias] verify '\(stem)': ✗ NOT found")
            }
        }
    }

    // MARK: - TTF name table binary patching

    /// Returns a copy of `data` where NameID 1 (Font Family), NameID 6
    /// (PostScript Name), and NameID 16 (Preferred Family) records in the
    /// OpenType 'name' table are replaced with `newName`.
    ///
    /// Why all three must be patched:
    ///   NameID 6  — `UIFont(name:)` lookup (the value React Native passes in)
    ///   NameID 1  — `font.familyName` return value; RCTFont.mm uses this for
    ///               weight/style variant lookup when fontWeight is also set
    ///   NameID 16 — Preferred Family; overrides NameID 1 when present, so it
    ///               must also be patched or familyName returns the wrong value
    ///
    /// The new name table is appended to the end of the font binary and the
    /// table directory entry is updated to point to it. Original bytes are
    /// left in place but ignored. No original files are modified.
    private static func patchFontNames(in data: Data, to newName: String) -> Data? {
        guard data.count >= 12 else { return nil }

        let numTables = readU16(data, at: 4)

        // Locate the 'name' table entry in the table directory.
        var nameDirOff = 0
        var nameTableOff = 0
        var found = false

        for i in 0..<Int(numTables) {
            let entry = 12 + i * 16
            guard entry + 16 <= data.count else { break }
            let tag = data[entry..<entry+4].reduce("") { $0 + String(UnicodeScalar($1)) }
            if tag == "name" {
                nameDirOff   = entry
                nameTableOff = Int(readU32(data, at: entry + 8))
                found = true
                break
            }
        }
        guard found, nameTableOff + 6 <= data.count else { return nil }

        let recordCount  = Int(readU16(data, at: nameTableOff + 2))
        let strAreaStart = nameTableOff + Int(readU16(data, at: nameTableOff + 4))

        // Rebuild the record list and string storage.
        // NameID 1, 6, 16 strings are replaced with newName.
        struct Rec { var platformID, encodingID, languageID, nameID: UInt16; var str: Data }
        var recs = [Rec]()

        for j in 0..<recordCount {
            let rOff = nameTableOff + 6 + j * 12
            guard rOff + 12 <= data.count else { break }

            let platformID = readU16(data, at: rOff)
            let encodingID = readU16(data, at: rOff + 2)
            let languageID = readU16(data, at: rOff + 4)
            let nameID     = readU16(data, at: rOff + 6)
            let strLen     = Int(readU16(data, at: rOff + 8))
            let strOff     = Int(readU16(data, at: rOff + 10))

            let strStart = strAreaStart + strOff
            let strData: Data

            if nameID == 1 || nameID == 6 || nameID == 16 {
                strData = platformID == 3
                    ? (newName.data(using: .utf16BigEndian) ?? Data())
                    : (newName.data(using: .ascii)          ?? Data())
            } else {
                guard strStart >= 0, strStart + strLen <= data.count else { continue }
                strData = data.subdata(in: strStart..<strStart + strLen)
            }
            recs.append(Rec(platformID: platformID, encodingID: encodingID,
                            languageID: languageID, nameID: nameID, str: strData))
        }

        // Build new string storage and record bytes with updated offsets.
        var stringStorage = Data()
        var recordBytes   = Data()

        for rec in recs {
            var rb = Data(count: 12)
            writeU16(rec.platformID, into: &rb, at: 0)
            writeU16(rec.encodingID, into: &rb, at: 2)
            writeU16(rec.languageID, into: &rb, at: 4)
            writeU16(rec.nameID,     into: &rb, at: 6)
            writeU16(UInt16(rec.str.count), into: &rb, at: 8)
            writeU16(UInt16(stringStorage.count), into: &rb, at: 10)
            recordBytes.append(rb)
            stringStorage.append(rec.str)
        }

        // Assemble new name table: 6-byte header + records + strings.
        let newStrOffset = UInt16(6 + recordBytes.count)
        var nameTable = Data(count: 6)
        writeU16(0, into: &nameTable, at: 0)                   // format
        writeU16(UInt16(recs.count), into: &nameTable, at: 2)  // count
        writeU16(newStrOffset,       into: &nameTable, at: 4)  // stringOffset
        nameTable.append(recordBytes)
        nameTable.append(stringStorage)
        while nameTable.count % 4 != 0 { nameTable.append(0) } // 4-byte align

        let checksum = tableChecksum(nameTable)

        // Append new table to font binary and update the directory entry.
        var result = data
        let newOff  = UInt32(result.count)
        let newLen  = UInt32(nameTable.count)
        result.append(nameTable)

        writeU32(checksum, into: &result, at: nameDirOff + 4)  // checksum
        writeU32(newOff,   into: &result, at: nameDirOff + 8)  // offset
        writeU32(newLen,   into: &result, at: nameDirOff + 12) // length

        return result
    }

    // MARK: - Big-endian read/write helpers

    private static func readU16(_ data: Data, at off: Int) -> UInt16 {
        guard off + 2 <= data.count else { return 0 }
        return (UInt16(data[off]) << 8) | UInt16(data[off + 1])
    }

    private static func readU32(_ data: Data, at off: Int) -> UInt32 {
        guard off + 4 <= data.count else { return 0 }
        return (UInt32(data[off]) << 24) | (UInt32(data[off+1]) << 16)
             | (UInt32(data[off+2]) << 8)  | UInt32(data[off+3])
    }

    private static func writeU16(_ v: UInt16, into d: inout Data, at off: Int) {
        d[off]     = UInt8(v >> 8)
        d[off + 1] = UInt8(v & 0xFF)
    }

    private static func writeU32(_ v: UInt32, into d: inout Data, at off: Int) {
        d[off]     = UInt8(v >> 24)
        d[off + 1] = UInt8((v >> 16) & 0xFF)
        d[off + 2] = UInt8((v >>  8) & 0xFF)
        d[off + 3] = UInt8(v & 0xFF)
    }

    private static func tableChecksum(_ data: Data) -> UInt32 {
        var sum: UInt32 = 0
        var i = 0
        while i + 4 <= data.count {
            sum = sum &+ readU32(data, at: i)
            i += 4
        }
        return sum
    }
}
