A **React Native** mobile application built with [`@react-native-community/cli`](https://github.com/react-native-community/cli).

---

# Getting Started

Follow the steps below **in order** to set up and run the project on your machine.

---

## Required Toolchain Versions

This app is pinned to a specific React Native version (see `react-native` in `package.json`). Each RN version requires an exact combination of Node, JDK, Xcode, Android SDK, Ruby, and CocoaPods — using the wrong combination causes obscure build failures.

| RN version | Node | React | JDK | Xcode | Ruby | CocoaPods | Yarn |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **0.85.x** | 22.22.0 – 22.x | 19.2.3 | 17.0.x | **26.1.1** *(latest at time of writing)* | 3.2.x – 3.3.x | 1.15.x – 1.16.x | 1.22.x |
| **0.81.4** | 20.19.4 – 22.x | 19.1.0 | 17.0.x | **26.1.1** | 3.2.x – 3.3.x | 1.15.x – 1.16.x | 1.22.x |
| **0.79.1** | 18.18 – 20.x | 19.0.0 | 17.0.x | **26.1.1** | 3.2.x – 3.3.x | 1.15.x – 1.16.x | 1.22.x |

Each cell lists the **tested range** — these are the exact versions this project has been verified against. Newer majors (Node 24, Ruby 3.4, CocoaPods 1.17, Yarn Berry, JDK 21) are not yet supported and may produce obscure build failures.

Full matrix (Android Gradle Plugin, compileSdk, targetSdk, minSdk, iOS deployment target) and install guidance: see [SUPPORTED_VERSIONS.md](https://github.com/101digital/app-studio-generator/blob/main/docs/SUPPORTED_VERSIONS.md).

**Xcode 26.1.1** is the only tested version for both rows. Older and newer Xcode versions are not supported.

---

## Step 0: Prerequisites (Install Required Tools)

Before you begin, make sure the following tools are installed on your computer.

### 1. Install Node.js

Pick the version that matches the React Native version this project is pinned to (see the matrix above):

| RN version | Tested Node range | Recommended |
| --- | --- | --- |
| 0.85.x | **22.22.0 – 22.x** | Node 22 LTS |
| 0.81.4 | **20.19.4 – 22.x** | Node 22 LTS |
| 0.79.1 | **18.18 – 20.x** | Node 20 LTS |

> Node 24 has **not** been tested with any of the RN rows and is likely to fail. RN 0.85 requires Node 22.22.0 at minimum — older 22.x patches will fail at install / build time.

Download and install Node.js from [https://nodejs.org](https://nodejs.org). Choose the **LTS** line, or use a version manager such as [`nvm`](https://github.com/nvm-sh/nvm) to install a specific tested version:

```sh
nvm install 22       # for RN 0.85.x or 0.81.4
nvm install 20       # for RN 0.79.1
```

To verify, open a terminal and run:

```sh
node --version
```

### 2. Install Yarn (Package Manager)

This project uses **Yarn Classic** — tested range **1.22.x** (most recent: 1.22.22). Install it globally via npm:

```sh
npm install -g yarn@1.22
```

Verify:

```sh
yarn --version
```

You should see a `1.22.x` version. **Yarn 2 / 3 / Berry / 4 are not supported** by this project — the lockfile, install hooks, and patch-package integration assume Yarn Classic.

### 3. Install Ruby (tested range 3.2.x – 3.3.x)

Ruby is needed for iOS CocoaPods. **Do not use the system Ruby that ships with macOS** — it lacks the permissions CocoaPods needs. Install a managed version with [rbenv](https://github.com/rbenv/rbenv) or [chruby](https://github.com/postmodern/chruby):

```sh
rbenv install 3.3.5  # any 3.2.x or 3.3.x release works
rbenv local 3.3.5
```

Verify:

```sh
ruby --version
```

You should see a `3.2.x` or `3.3.x` release. Ruby 3.4 and 4.x are not yet tested.

### 4. Install Watchman (macOS)

```sh
brew install watchman
```

### 5. Install JDK 17 (Android builds)

Android builds require the **JDK 17 line** (tested range **17.0.x**). No other major version is supported by the Android Gradle Plugin this project uses. On macOS the simplest install is via Homebrew:

```sh
brew install --cask zulu@17
```

On Windows / Linux, use the [Eclipse Temurin 17](https://adoptium.net/temurin/releases/?version=17) installer.

Set `JAVA_HOME` to point at the JDK 17 install. On macOS with the Homebrew install above:

```sh
export JAVA_HOME=/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home
```

Add that line to your `~/.zshrc` / `~/.bashrc` so it persists across terminals.

Verify:

```sh
java -version
```

You should see `17.0.x`. **JDK 18, 21, and 24 are NOT supported** by this project's Gradle setup — newer JDKs will silently change the bytecode level and break the Android build.

### 6. Set Up Platform-Specific Tools

Follow the official React Native environment setup guide for your target platform:

👉 [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment)

**For Android:**

- Install [Android Studio](https://developer.android.com/studio)
- During setup, make sure to install the **Android SDK**, **Android SDK Platform**, and **Android Virtual Device (AVD)**
- Set up the `ANDROID_HOME` environment variable (the guide above explains how)
- Create an Android Emulator via AVD Manager in Android Studio

**For iOS (macOS only):**

- Install **Xcode 26.1.1** (the version this project is tested on). Download from the [Apple Developer portal](https://developer.apple.com/xcode/) or the Mac App Store.
- Open Xcode and install the **iOS Simulator** (Xcode → Settings → Platforms → install iOS 15.1 or newer).
- Install Xcode Command Line Tools:

```sh
xcode-select --install
```

Verify Xcode version:

```sh
xcodebuild -version
```

You should see `Xcode 26.1.1`. Older Xcode versions are not supported.

---

## Step 1: Install Project Dependencies

Open a terminal, navigate to the project folder, and run:

```sh
yarn install
```

> This will install all JavaScript dependencies **and** automatically run `patch-package` and `react-native-asset` as a post-install step.

---

## Step 2: Install iOS Dependencies (macOS / iOS only)

If you plan to run the app on **iOS**, you need to install CocoaPods dependencies.

This project's tested CocoaPods range is **1.15.x – 1.16.x**. The `Gemfile` already pins the right Bundler-managed version, so you don't need to install CocoaPods globally — `bundle install` below handles it for you. If you have an older system-wide CocoaPods, it will be ignored as long as you use the `bundle exec` flow below. CocoaPods 1.17+ has not been tested.

### First-time setup — install CocoaPods via Ruby Bundler:

```sh
bundle install
```

### Then install the pods:

```sh
cd ios
pod install
cd ..
```

> **Tip:** If you're on an Apple Silicon Mac (M1/M2/M3) and encounter issues, try:
>
> ```sh
> cd ios
> arch -x86_64 pod install
> cd ..
> ```
>
> Or use the built-in shortcut script:
>
> ```sh
> yarn install-pod
> ```

---

## Step 3: Start Metro (JavaScript Bundler)

Metro is the JavaScript bundler for React Native. Start it by running:

```sh
yarn start
```

Keep this terminal window **open and running** — it needs to stay active while you use the app.

---

## Step 4: Run the App

Open a **new terminal window** (keep Metro running in the other one) and run:

### Android (Development)

```sh
yarn android-dev
```

> Make sure you have an **Android Emulator running** or a **physical device connected via USB** with USB debugging enabled.

### iOS (Development) — macOS only

```sh
yarn ios-dev
```

> This will launch the app in the iOS Simulator.

---

## Available Run Commands

| Command                | Description                        |
| ---------------------- | ---------------------------------- |
| `yarn android-dev`     | Run on Android (Development build) |
| `yarn ios-dev`         | Run on iOS (Development build)     |
| `yarn android-staging` | Run on Android (Staging build)     |
| `yarn ios-staging`     | Run on iOS (Staging build)         |
| `yarn android-prod`    | Run on Android (Production build)  |
| `yarn ios-prod`        | Run on iOS (Production build)      |

---

## Environment Configuration

The project uses [react-native-config](https://github.com/lukewalczak/react-native-config) for environment variables. The following env files are available:

| File               | Used For    |
| ------------------ | ----------- |
| `.env.development` | Development |
| `.env.staging`     | Staging     |
| `.env.production`  | Production  |
| `.env`             | Default     |

> These files are already included in the project. You should not need to modify them unless instructed to.

---


## Running E2E Tests (Maestro)

This project includes end-to-end (E2E) tests powered by [Maestro](https://maestro.mobile.dev/).

### Prerequisites

1. Install Maestro CLI:

```sh
curl -Ls "https://get.maestro.mobile.dev" | bash
```

2. Make sure an **Android Emulator** or **iOS Simulator** is running.

### Run Tests

Use the provided test runner script:

#### Android

```sh
# Development build
yarn e2e:dev-test-android

# Staging build
yarn e2e:staging-test-android

# Production build
yarn e2e:prod-test-android
```

#### iOS

```sh
# Development build
yarn e2e:dev-test-ios

# Staging build
yarn e2e:staging-test-ios

# Production build
yarn e2e:prod-test-ios
```

### Test Structure

| Folder / File              | Description                                  |
| -------------------------- | -------------------------------------------- |
| `e2e/`                     | Root directory for all E2E test files        |
| `e2e/master_suite.yaml`    | Master test suite that runs all screen tests |
| `e2e/common/`              | Reusable flows (tap, input, dropdown, etc.)  |
| `e2e/screens/`             | Per-screen test flows                        |
| `run_maestro_test.sh`      | Shell script to build, install, and run tests|
| `parseMaestroLog.js`       | Parses Maestro test output to JSON           |
| `generateTestReport.js`    | Generates comprehensive test reports         |

### Test Reports

After running tests, reports are generated in the `test-reports/` directory:

- **JSON report** — machine-readable test results
- **Detailed log** — full Maestro output in `maestro-detailed-output.log`

---


## Other Useful Commands

| Command            | Description                                     |
| ------------------ | ----------------------------------------------- |
| `yarn start`       | Start the Metro bundler                         |
| `yarn test`        | Run unit tests with Jest                        |
| `yarn lint`        | Run ESLint on source files                      |
| `yarn format`      | Format code with Prettier                       |
| `yarn install-pod` | Install Ruby bundler + CocoaPods (iOS shortcut) |

---

## Troubleshooting

### Common Issues

- **Metro bundler fails to start** — Make sure no other Metro process is running. Kill it with <kbd>Ctrl</kbd> + <kbd>C</kbd> and try again.
- **Android build fails** — Ensure `ANDROID_HOME` is set correctly and an emulator is running or a device is connected.
- **iOS pod install fails** — Try `arch -x86_64 pod install` on Apple Silicon Macs, or delete the `ios/Pods` folder and `ios/Podfile.lock` then re-run `pod install`.
- **"Command not found: yarn"** — Run `npm install -g yarn` to install Yarn globally.
- **Node version out of range** — Use the tested Node range for your pinned RN release (see Step 0.1: 18.18 – 20.x for RN 0.79.1, 20.19.4 – 22.x for RN 0.81.4, 22.22.0 – 22.x for RN 0.85.x). Higher Node majors (24+) are not yet tested and will likely fail.

For more help, see the official [React Native Troubleshooting guide](https://reactnative.dev/docs/troubleshooting).

---

## Learn More

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [React Native Environment Setup](https://reactnative.dev/docs/set-up-your-environment)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [`@facebook/react-native`](https://github.com/facebook/react-native) — React Native GitHub repository
