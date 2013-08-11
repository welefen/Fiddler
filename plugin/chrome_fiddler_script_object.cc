#include "chrome_fiddler_script_object.h"

#include <stdlib.h>
#include <string.h>

#ifdef _WINDOWS
#include <atlenc.h>
#include <GdiPlus.h>
#include <io.h>
#include <ShlObj.h>
#elif defined __APPLE__
#include <libgen.h>
#include <resolv.h>
#endif

#include <string>

#include "log.h"
#include "chrome_fiddler_plugin.h"
#include "utils.h"

#ifdef _WINDOWS
using namespace Gdiplus;
#define snprintf sprintf_s
struct BrowserParam {
    TCHAR initial_path[MAX_PATH];
    TCHAR title[MAX_PATH];
};
#else
#define MAX_PATH 260
#endif

extern Log g_logger;

NPObject* ChromeFiddlerScriptObject::Allocate(NPP npp, NPClass *aClass) {
    g_logger.WriteLog("msg", "ChromeFiddlerScriptObject Allocate");
    ChromeFiddlerScriptObject* script_object = new ChromeFiddlerScriptObject;
    if (script_object != NULL)
        script_object->set_plugin((PluginBase*)npp->pdata);
    return script_object;
}

void ChromeFiddlerScriptObject::Deallocate() {
    g_logger.WriteLog("msg", "ChromeFiddlerScriptObject Deallocate");
    delete this;
}

void ChromeFiddlerScriptObject::InitHandler() {
    FunctionItem item;
    item.function_name = "OpenFileDialog";
    item.function_pointer = ON_INVOKEHELPER(&ChromeFiddlerScriptObject::OpenFileDialog);
    AddFunction(item);
    item.function_name = "GetFilePath";
    item.function_pointer = ON_INVOKEHELPER(&ChromeFiddlerScriptObject::GetFilePath);
    AddFunction(item);
    item.function_name = "GetFolderPath";
    item.function_pointer = ON_INVOKEHELPER(&ChromeFiddlerScriptObject::GetFolderPath);
    AddFunction(item);
}

#ifdef _WINDOWS
namespace {

int WINAPI BrowserCallback(NativeWindow nw, UINT uMsg, LPARAM lParam, LPARAM lpData) {
    switch (uMsg) {
    case BFFM_INITIALIZED:
        BrowserParam* param = (BrowserParam*)lpData;
        SendMessage(nw, BFFM_SETSELECTION, TRUE, (LPARAM)param->initial_path);
        SetWindowText(nw, param->title);
        NativeWindow treeview = FindWindowEx(nw, NULL, L"SysTreeView32", NULL);
        NativeWindow ok_button = FindWindowEx(nw, NULL, L"Button", NULL);

        if (treeview && ok_button) {
            RECT rect_treeview,rect_ok_button;

            GetWindowRect(treeview, &rect_treeview);
            POINT pt_treeview, pt_button;
            pt_treeview.x = rect_treeview.left;
            pt_treeview.y = 0;
            ScreenToClient(nw, &pt_treeview);

            GetWindowRect(ok_button, &rect_ok_button);
            pt_button.x = rect_ok_button.left;
            pt_button.y = rect_ok_button.top;
            ScreenToClient(nw, &pt_button);
            MoveWindow(treeview, pt_treeview.x, pt_treeview.x, rect_treeview.right-rect_treeview.left, pt_button.y-2*pt_treeview.x, TRUE);
        }
        break;
    }
    return 0;
}

}
#elif defined __APPLE__
std::string GetFilePathNS(const char* path, const char* dialog_title, bool isFolder);
#endif

bool ChromeFiddlerScriptObject::OpenFileDialog(const NPVariant* args, uint32_t argCount, NPVariant* result) {
    if (argCount < 2 || !NPVARIANT_IS_STRING(args[0]) || !NPVARIANT_IS_STRING(args[1]))
        return false;

    std::string option(NPVARIANT_TO_STRING(args[1]).UTF8Characters, NPVARIANT_TO_STRING(args[1]).UTF8Length);
    std::string title = "Select A Stuff, Buddy";
    size_t length = title.length();

    NPVariant dialog_title;
    STRINGN_TO_NPVARIANT(title.c_str(), length, dialog_title);
    const NPVariant params[2] = {args[0], dialog_title};

    if (option == "file")
        return GetFilePath(params, 2, result);
    else
        return GetFolderPath(params, 2, result);
}

bool ChromeFiddlerScriptObject::GetFilePath(const NPVariant* args, uint32_t argCount, NPVariant* result) {
    if (argCount < 2 || !NPVARIANT_IS_STRING(args[0]) || !NPVARIANT_IS_STRING(args[1]))
        return false;

    std::string path(NPVARIANT_TO_STRING(args[0]).UTF8Characters, NPVARIANT_TO_STRING(args[0]).UTF8Length);
    std::string title(NPVARIANT_TO_STRING(args[1]).UTF8Characters, NPVARIANT_TO_STRING(args[1]).UTF8Length);

#ifdef _WINDOWS
    TCHAR display_name[MAX_PATH] = {0};
    BrowserParam param = {0};
    BOOL bRet;

    MultiByteToWideChar(CP_UTF8, 0, path.c_str(), -1, param.initial_path, MAX_PATH);
    MultiByteToWideChar(CP_UTF8, 0, title.c_str(), -1, param.title, MAX_PATH);

    OPENFILENAME ofn = {0};
    ofn.lStructSize = sizeof(ofn);
    ofn.hwndOwner = get_plugin()->get_native_window();
    ofn.lpstrFilter = _T("All Files(*.*)\0*.*\0");
    ofn.lpstrInitialDir = param.initial_path;
    ofn.lpstrFile = display_name;
    ofn.nMaxFile = sizeof(display_name) / sizeof(*display_name);
    ofn.nFilterIndex = 0;
    ofn.lpstrTitle = param.title;
    ofn.Flags = OFN_PATHMUSTEXIST | OFN_FILEMUSTEXIST | OFN_EXPLORER;

    bRet = GetOpenFileName(&ofn);

    char utf8[MAX_PATH];
    WideCharToMultiByte(CP_UTF8, 0, bRet ? display_name : param.initial_path, -1, utf8, MAX_PATH, 0, 0);
    size_t length = strlen(utf8);

#elif __APPLE__
    std::string pathStr = GetFilePathNS(path.c_str(), title.c_str(), false);
    const char* utf8 = pathStr.c_str();
    size_t length = pathStr.length();

#endif

    char* copy = (char *)NPN_MemAlloc(length + 1);
    memcpy(copy, utf8, length);
    copy[length] = 0;
    STRINGN_TO_NPVARIANT(copy, length, *result);

    return true;
}

bool ChromeFiddlerScriptObject::GetFolderPath(const NPVariant* args, uint32_t argCount, NPVariant* result) {
    if (argCount < 2 || !NPVARIANT_IS_STRING(args[0]) || !NPVARIANT_IS_STRING(args[1]))
        return false;

    std::string path(NPVARIANT_TO_STRING(args[0]).UTF8Characters, NPVARIANT_TO_STRING(args[0]).UTF8Length);
    std::string title(NPVARIANT_TO_STRING(args[1]).UTF8Characters, NPVARIANT_TO_STRING(args[1]).UTF8Length);

#ifdef _WINDOWS
    TCHAR display_name[MAX_PATH] = {0};
    BrowserParam param = {0};
    BOOL bRet;

    MultiByteToWideChar(CP_UTF8, 0, path.c_str(), -1, param.initial_path, MAX_PATH);
    MultiByteToWideChar(CP_UTF8, 0, title.c_str(), -1, param.title, MAX_PATH);

    BROWSEINFO info = {0};
    info.hwndOwner = get_plugin()->get_native_window();
    info.lpszTitle = NULL;
    info.pszDisplayName = display_name;
    info.lpfn = BrowserCallback;
    info.ulFlags = BIF_RETURNONLYFSDIRS;
    info.lParam = (LPARAM)&param;

    bRet = SHGetPathFromIDList(SHBrowseForFolder(&info), display_name);

    char utf8[MAX_PATH];
    WideCharToMultiByte(CP_UTF8, 0, bRet ? display_name : param.initial_path, -1, utf8, MAX_PATH, 0, 0);
    size_t length = strlen(utf8);

#elif __APPLE__
    std::string pathStr = GetFilePathNS(path.c_str(), title.c_str(), true);
    const char* utf8 = pathStr.c_str();
    size_t length = pathStr.length();

#endif

    char* copy = (char *)NPN_MemAlloc(length + 1);
    memcpy(copy, utf8, length);
    copy[length] = 0;
    STRINGN_TO_NPVARIANT(copy, length, *result);

    return true;
}

// static
void ChromeFiddlerScriptObject::InvokeCallback(NPP npp, NPObject* callback, const char* param) {
    NPVariant npParam;
    STRINGZ_TO_NPVARIANT(param, npParam);
    NPVariant result;
    VOID_TO_NPVARIANT(result);
    NPN_InvokeDefault(npp, callback, &npParam, 1, &result);
}

