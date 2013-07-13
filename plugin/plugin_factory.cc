#include "plugin_factory.h"
#include "chrome_fiddler_plugin.h"

PluginFactory::PluginTypeMap PluginFactory::plugin_type_map_;

void PluginFactory::Init() {
    PluginTypeItem item;
    item.mime_type = "application/x-chromefiddler";
    item.constructor = &ChromeFiddlerPlugin::CreateObject;
    plugin_type_map_.insert(PluginTypeMap::value_type(item.mime_type, item));
}

PluginBase* PluginFactory::NewPlugin(NPMIMEType pluginType) {
    PluginBase* plugin = NULL;
    PluginTypeMap::iterator iter = plugin_type_map_.find(pluginType);
    if (iter != plugin_type_map_.end())
        plugin = iter->second.constructor();

    return plugin;
}
