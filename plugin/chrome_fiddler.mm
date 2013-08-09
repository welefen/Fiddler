#include <string>
#import <Cocoa/Cocoa.h>


std::string GetFilePath(const char* path, const char* dialog_title, std::string option) {
    int runResult;
    NSString *str = [NSString stringWithUTF8String:path];
    str = [NSString stringWithFormat:@"%@%@", @"file://", str];
    NSURL *url = [NSURL URLWithString:[str stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding]];

    NSOpenPanel *op = [NSOpenPanel openPanel];

    if (option == "file") {
        [op setCanChooseDirectories:NO];
        [op setCanChooseFiles:YES];
    } else if (option == "path") {
        [op setCanChooseDirectories:YES];
        [op setCanChooseFiles:NO];
    } else {
        [op setCanChooseDirectories:YES];
        [op setCanChooseFiles:YES];
    }
    [op setAllowsMultipleSelection:NO];
    [op setDirectoryURL:url];
    [op setTitle:[NSString stringWithUTF8String:dialog_title]];

    runResult = [op runModal];

    if (runResult == NSOKButton) {
        NSArray *paths = [op URLs];
        return [[[paths lastObject] path] UTF8String];
    } else {
        return [[NSString stringWithUTF8String:path] UTF8String];
    }
}

