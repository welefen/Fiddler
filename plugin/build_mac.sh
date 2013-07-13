#!/bin/sh
mkdir -p chrome_fiddler.plugin/Contents/MacOS
cp -f Info.plist chrome_fiddler.plugin/Contents
g++ -framework Cocoa -DMAC -Wall \
    -DWEBKIT_DARWIN_SDK -lresolv -arch i386 -bundle \
    -isysroot /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX10.8.sdk/ \
    -mmacosx-version-min=10.6 \
    -o chrome_fiddler.plugin/Contents/MacOS/chrome_fiddler \
    log.cc np_entry.cc npn_entry.cc npp_entry.cc plugin_base.cc \
    plugin_factory.cc chrome_fiddler.mm chrome_fiddler_plugin.cc \
    chrome_fiddler_script_object.cc script_object_base.cc script_object_factory.cc
