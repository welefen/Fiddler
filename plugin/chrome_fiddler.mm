#include <string>
#import <Cocoa/Cocoa.h>


std::string GetFilePathNS(const char* path, const char* dialog_title, bool isFolder) {
    int runResult;
    NSString *str = [NSString stringWithUTF8String:path];
    str = [NSString stringWithFormat:@"%@%@", @"file://", str];
    NSURL *url = [NSURL URLWithString:[str stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding]];

    NSOpenPanel *op = [NSOpenPanel openPanel];

    if (isFolder) {
        [op setCanChooseDirectories:YES];
        [op setCanChooseFiles:NO];
    } else {
        [op setCanChooseDirectories:NO];
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

bool IsWritableFile(const char* path) {
    NSFileManager *fm = [NSFileManager defaultManager];
    return [fm isWritableFileAtPath:[NSString stringWithUTF8String:path]];
}

