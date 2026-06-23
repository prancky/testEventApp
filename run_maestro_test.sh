PLATFORM=$1
ENV=${2:-dev}

# Test Data Configuration - Update these values as needed
VALID_COUNTRY_CODE="94"
VALID_MOBILE="768891275"
VALID_PASSWORD="Password@12345"

# Set environment-specific variables
case "$ENV" in
dev)
	ANDROID_APP_ID="com.testeventapp.dev"
	IOS_APP_ID="org.reactjs.native.example.testeventapp"
	APK_PATH="app/build/outputs/apk/development/debug/app-development-debug.apk"
	SCHEME="testeventapp-Development"
	;;
staging)
	ANDROID_APP_ID="com.testeventapp.staging"
	IOS_APP_ID="org.reactjs.native.example.testeventappStaging"
	APK_PATH="app/build/outputs/apk/staging/debug/app-staging-debug.apk"
	SCHEME="testApp-Staging"
	;;
prod)
	ANDROID_APP_ID="com.testeventapp"
	IOS_APP_ID="org.reactjs.native.example.testeventapp"
	APK_PATH="app/build/outputs/apk/release/app-release.apk"
	SCHEME="testeventapp"
	;;
*)
	echo "Unknown environment: $ENV"
	exit 1
	;;
esac

if [ "$PLATFORM" == "android" ]; then
	cd android
	echo "🛠️  Building APK..."
	case "$ENV" in
	dev)
		./gradlew assembleDevelopmentDebug
		;;
	staging)
		./gradlew assembleStagingDebug
		;;
	prod)
		./gradlew assembleRelease
		;;
	esac
	echo "📱 Installing APK..."
	adb install -r "$APK_PATH"
	cd ..
	echo "⌨️  Disabling virtual keyboard..."
	adb shell settings put secure show_ime_with_hard_keyboard 0
	adb shell ime disable com.android.inputmethod.latin/.LatinIME 2>/dev/null || true
	echo "🚀 Running Master Test Suite on Android..."
	maestro test e2e/master_suite.yaml \
		--env APP_ID="$ANDROID_APP_ID" \
		--env VALID_COUNTRY_CODE="$VALID_COUNTRY_CODE" \
		--env VALID_MOBILE="$VALID_MOBILE" \
		--env VALID_PASSWORD="$VALID_PASSWORD" |
		tee maestro-detailed-output.log

	# Convert XML to JSON
	echo "📊 Parsing Maestro log to JSON..."
	node parseMaestroLog.js maestro-detailed-output.log

	# Generate comprehensive test reports
	echo "📈 Generating comprehensive test reports..."
	node generateTestReport.js e2e/master_suite.yaml e2e maestro-detailed-output.log test-reports test-metadata.json

elif [ "$PLATFORM" == "ios" ]; then
	APP_NAME="testeventapp"
	WORKSPACE="ios/$APP_NAME.xcworkspace"
	DESTINATION="platform=iOS Simulator,name=iPhone 16 Pro"
	BUILD_DIR="ios/build"

	echo "🛠️  Building iOS app for simulator..."
	xcrun xcodebuild -workspace "$WORKSPACE" \
		-scheme "$SCHEME" \
		-configuration Development \
		-sdk iphonesimulator \
		-destination "$DESTINATION" \
		-derivedDataPath "$BUILD_DIR" \
		-build

	APP_PATH="$BUILD_DIR/Build/Products/Release-iphonesimulator/$APP_NAME.app"

	if [ ! -d "$APP_PATH" ]; then
		echo "Build failed or .app not found at $APP_PATH"
		exit 1
	fi

	echo "📱 Preparing simulator..."
	SIM_STATUS=$(xcrun simctl list | grep -A1 "iPhone 16 Pro" | grep -o "Booted")
	if [ "$SIM_STATUS" != "Booted" ]; then
		echo "🔄 Booting iPhone 16 Pro simulator..."
		xcrun simctl boot "iPhone 16 Pro"
	else
		echo "iPhone 16 Pro simulator already booted."
	fi

	echo "🔁 Restarting Simulator UI..."
	killall Simulator || true
	open -a Simulator

	echo "📲 Installing app to simulator..."
	xcrun simctl install booted "$APP_PATH"

	echo "🚀 Launching app..."
	xcrun simctl launch booted org.reactjs.native.example.testeventapp

	echo "✅ Running Master Test Suite on iOS..."
	maestro test e2e/master_suite.yaml \
		--env APP_ID="$IOS_APP_ID" \
		--env VALID_COUNTRY_CODE="$VALID_COUNTRY_CODE" \
		--env VALID_MOBILE="$VALID_MOBILE" \
		--env VALID_PASSWORD="$VALID_PASSWORD" |
		tee maestro-detailed-output.log

	# Generate comprehensive test reports
	echo "📈 Generating comprehensive test reports..."
	node generateTestReport.js e2e/master_suite.yaml e2e maestro-detailed-output.log test-reports test-metadata.json

else
	echo "Usage: $0 [android|ios]"
	exit 1
fi
