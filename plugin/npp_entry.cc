#include "log.h"
#include "npfunctions.h"
#include "plugin_base.h"
#include "plugin_factory.h"

extern Log g_logger;

#ifdef XP_UNIX
char* NPP_GetMIMEDescription() {
    return "";
}
#endif

NPError NP_LOADDS NPP_Initialize() {
    return NPERR_NO_ERROR;
}

void NP_LOADDS NPP_Shutdown() {
}

NPError NP_LOADDS NPP_New(NPMIMEType pluginType, NPP instance, uint16_t mode, int16_t argc, char* argn[], char* argv[], NPSavedData* saved) {
    g_logger.WriteLog("msg", "NPP_New");
    PluginBase* pPlugin = PluginFactory::NewPlugin(pluginType);
    if (pPlugin == NULL)
        return NPERR_OUT_OF_MEMORY_ERROR;
    else
        return pPlugin->Init(instance, mode, argc, argn, argv, saved);
}

NPError NP_LOADDS NPP_Destroy(NPP instance, NPSavedData** save) {
    g_logger.WriteLog("msg", "NPP_Destory");
    PluginBase* pPlugin = (PluginBase*)instance->pdata;
    return pPlugin->UnInit(save);
}

NPError NP_LOADDS NPP_SetWindow(NPP instance, NPWindow* window) {
    PluginBase* pPlugin = (PluginBase*)instance->pdata;
    return pPlugin->SetWindow(window);
}

NPError NP_LOADDS NPP_NewStream(NPP instance, NPMIMEType type, NPStream* stream, NPBool seekable, uint16_t* stype) {
    PluginBase* pPlugin = (PluginBase*)instance->pdata;
    return pPlugin->NewStream(type, stream, seekable, stype);
}

NPError NP_LOADDS NPP_DestroyStream(NPP instance, NPStream* stream, NPReason reason) {
    PluginBase* pPlugin = (PluginBase*)instance->pdata;
    return pPlugin->DestroyStream(stream, reason);
}

int32_t NP_LOADDS NPP_WriteReady(NPP instance, NPStream* stream) {
    PluginBase* pPlugin = (PluginBase*)instance->pdata;
    return pPlugin->WriteReady(stream);
}

int32_t NP_LOADDS NPP_Write(NPP instance, NPStream* stream, int32_t offset, int32_t len, void* buffer) {
    PluginBase* pPlugin = (PluginBase*)instance->pdata;
    return pPlugin->Write(stream, offset, len, buffer);
}

void NP_LOADDS NPP_StreamAsFile(NPP instance, NPStream* stream, const char* fname) {
    PluginBase* pPlugin = (PluginBase*)instance->pdata;
    pPlugin->StreamAsFile(stream, fname);
}

void NP_LOADDS NPP_Print(NPP instance, NPPrint* platformPrint) {
    PluginBase* pPlugin = (PluginBase*)instance->pdata;
    pPlugin->Print(platformPrint);
}

int16_t NP_LOADDS NPP_HandleEvent(NPP instance, void* event) {
    PluginBase* pPlugin = (PluginBase*)instance->pdata;
    return pPlugin->HandleEvent(event);
}

void NP_LOADDS NPP_URLNotify(NPP instance, const char* url, NPReason reason, void* notifyData) {
    PluginBase* pPlugin = (PluginBase*)instance->pdata;
    pPlugin->URLNotify(url, reason, notifyData);
}

NPError NP_LOADDS NPP_GetValue(NPP instance, NPPVariable variable, void *value) {
    if (instance == NULL) {
        if (variable == NPPVpluginNameString)
            *((const char **)value) = "Chrome Fiddler";
        else if (variable == NPPVpluginDescriptionString)
            *((const char **)value) = "Chrome Fiddler Plugin";
        else
            return NPERR_GENERIC_ERROR;
    } else {
        PluginBase* pPlugin = (PluginBase*)instance->pdata;
        return pPlugin->GetValue(variable, value);
    }
    return NPERR_NO_ERROR;
}

NPError NP_LOADDS NPP_SetValue(NPP instance, NPNVariable variable, void *value) {
    PluginBase* pPlugin = (PluginBase*)instance->pdata;
    return pPlugin->SetValue(variable, value);
}
