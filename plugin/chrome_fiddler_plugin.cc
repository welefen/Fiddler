#include "chrome_fiddler_plugin.h"

#include <string.h>

#include "log.h"
#include "chrome_fiddler_script_object.h"
#include "script_object_factory.h"


extern Log g_logger;

NPError ChromeFiddlerPlugin::Init(NPP instance, uint16_t mode, int16_t argc, char* argn[],char* argv[], NPSavedData* saved) {
    g_logger.WriteLog("msg", "ChromeFiddlerPlugin Init");
    script_object_ = NULL;

#ifdef _WINDOWS
    int bWindowed = 1;
#else
    int bWindowed = 0;
#endif

#ifdef MAC
    // Select the right drawing model if necessary.
    NPBool support_core_graphics = false;
    if (NPN_GetValue(instance, NPNVsupportsCoreGraphicsBool, &support_core_graphics) == NPERR_NO_ERROR && support_core_graphics)
        NPN_SetValue(instance, NPPVpluginDrawingModel, (void*)NPDrawingModelCoreGraphics);
    else
        return NPERR_INCOMPATIBLE_VERSION_ERROR;

    // Select the Cocoa event model.
    NPBool support_cocoa_events = false;
    if (NPN_GetValue(instance, NPNVsupportsCocoaBool, &support_cocoa_events) == NPERR_NO_ERROR && support_cocoa_events)
        NPN_SetValue(instance, NPPVpluginEventModel, (void*)NPEventModelCocoa);
    else
        return NPERR_INCOMPATIBLE_VERSION_ERROR;
#endif

    NPN_SetValue(instance, NPPVpluginWindowBool, (void *)bWindowed);
    instance->pdata = this;
    return PluginBase::Init(instance, mode, argc, argn, argv, saved);
}

NPError ChromeFiddlerPlugin::UnInit(NPSavedData** save) {
    g_logger.WriteLog("msg", "ChromeFiddlerPlugin UnInit");
    PluginBase::UnInit(save);
    script_object_ = NULL;
    return NPERR_NO_ERROR;
}

NPError ChromeFiddlerPlugin::GetValue(NPPVariable variable, void *value) {
    switch(variable) {
        case NPPVpluginScriptableNPObject:
            if (script_object_ == NULL)
                script_object_ = ScriptObjectFactory::CreateObject(get_npp(), ChromeFiddlerScriptObject::Allocate);
            if (script_object_ != NULL)
                *(NPObject**)value = script_object_;
            else
                return NPERR_OUT_OF_MEMORY_ERROR;
            break;
        case NPPVpluginNeedsXEmbed:
            *(bool*)value = 1;
            break;
        default:
            return NPERR_GENERIC_ERROR;
    }
    return NPERR_NO_ERROR;
}

NPError ChromeFiddlerPlugin::SetWindow(NPWindow* window) {
#ifdef _WINDOWS
    PluginBase::SetWindow(window);
#endif

    return NPERR_NO_ERROR;
}

