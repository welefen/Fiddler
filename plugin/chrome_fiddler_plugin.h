#ifndef CHROME_FIDDLER_PLUGIN_H_
#define CHROME_FIDDLER_PLUGIN_H_

#include "npapi.h"
#include "npruntime.h"
#include "npfunctions.h"
#include "plugin_base.h"
#include "script_object_base.h"

class ChromeFiddlerPlugin : public PluginBase {
public:
    ChromeFiddlerPlugin() {}
    virtual ~ChromeFiddlerPlugin() {}

    NPError Init(NPP instance, uint16_t mode, int16_t argc, char* argn[], char* argv[], NPSavedData* saved);
    NPError UnInit(NPSavedData** saved);
    NPError GetValue(NPPVariable variable, void *value);
    NPError SetWindow(NPWindow* window);

    static PluginBase* CreateObject() { return new ChromeFiddlerPlugin; }

private:
    ScriptObjectBase* script_object_;
};

#endif // CHROME_FIDDLER_PLUGIN_H_
