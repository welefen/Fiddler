#include <stdio.h>

#include "log.h"
#include "npapi.h"
#include "npfunctions.h"
#include "plugin_factory.h"

#ifdef _WINDOWS
#include <windows.h>
#include <GdiPlus.h>
using namespace Gdiplus;
ULONG_PTR token;
#pragma comment(lib,"gdiplus.lib")
#endif

extern NPNetscapeFuncs* g_npn_funcs;

Log g_logger;

#ifdef __cplusplus
extern "C" {
#endif

#ifndef HIBYTE
#define HIBYTE(x) ((((unsigned short)(x)) & 0xff00) >> 8)
#endif

NPError OSCALL NP_GetEntryPoints(NPPluginFuncs* nppfuncs) {
    nppfuncs->version = (NP_VERSION_MAJOR << 8) | NP_VERSION_MINOR;
    nppfuncs->newp = NPP_New;
    nppfuncs->destroy = NPP_Destroy;
    nppfuncs->setwindow = NPP_SetWindow;
    nppfuncs->newstream = NPP_NewStream;
    nppfuncs->destroystream = NPP_DestroyStream;
    nppfuncs->asfile = NPP_StreamAsFile;
    nppfuncs->writeready = NPP_WriteReady;
    nppfuncs->write = NPP_Write;
    nppfuncs->print = NPP_Print;
    nppfuncs->event = NPP_HandleEvent;
    nppfuncs->urlnotify = NPP_URLNotify;
    nppfuncs->getvalue = NPP_GetValue;
    nppfuncs->setvalue = NPP_SetValue;
    return NPERR_NO_ERROR;
}

NPError OSCALL NP_Initialize(NPNetscapeFuncs* npnf
#if !defined(_WINDOWS) && !defined(WEBKIT_DARWIN_SDK)
                             , NPPluginFuncs* nppfuncs
#endif
                             ) {
    PluginFactory::Init();
    g_logger.OpenLog("NPAPI");
    if(npnf == NULL) {
        return NPERR_INVALID_FUNCTABLE_ERROR;
    }
    if(HIBYTE(npnf->version) > NP_VERSION_MAJOR) {
        return NPERR_INCOMPATIBLE_VERSION_ERROR;
    }
    g_npn_funcs = npnf;
#if !defined(_WINDOWS) && !defined(WEBKIT_DARWIN_SDK)
    NP_GetEntryPoints(nppfuncs);
#endif
#ifdef _WINDOWS
    GdiplusStartupInput input;
    GdiplusStartup(&token, &input, NULL);
#endif
    return NPERR_NO_ERROR;
}

NPError OSCALL NP_Shutdown() {
#ifdef _WINDOWS
    GdiplusShutdown(token);
#endif
    return NPERR_NO_ERROR;
}

char* NP_GetMIMEDescription(void) {
    return "application/x-chromefiddler::Fiddler in Chrome";
}

// Needs to be present for WebKit based browsers.
NPError OSCALL NP_GetValue(void* npp, NPPVariable variable, void* value) {
    return NPP_GetValue((NPP)npp, variable, value);
}
#ifdef __cplusplus
}
#endif
