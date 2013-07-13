#ifndef SCRIPT_OBJECT_BASE_H_
#define SCRIPT_OBJECT_BASE_H_

#include <map>
#include <string>

#include "npapi.h"
#include "npruntime.h"
#include "plugin_base.h"

class ScriptObjectBase : public NPObject {
public:
    ScriptObjectBase(void) {}
    virtual ~ScriptObjectBase(void) {}

    typedef bool (ScriptObjectBase::*InvokePtr)(const NPVariant *args, uint32_t argCount, NPVariant *result);

    struct FunctionItem {
        std::string function_name;
        InvokePtr function_pointer;
    };

    struct PropertyItem {
        std::string property_name;
        NPVariant property_value;
    };

    virtual void Deallocate() = 0;
    virtual void Invalidate() = 0;
    virtual bool HasMethod(NPIdentifier name);
    virtual bool Invoke(NPIdentifier name, const NPVariant *args, uint32_t argCount, NPVariant *result);
    virtual bool InvokeDefault(const NPVariant *args, uint32_t argCount, NPVariant *result) { return false; }
    virtual bool HasProperty(NPIdentifier name);
    virtual bool GetProperty(NPIdentifier name, NPVariant *result);
    virtual bool SetProperty(NPIdentifier name, const NPVariant *value);
    virtual bool RemoveProperty(NPIdentifier name);
    virtual bool Enumerate(NPIdentifier **value, uint32_t *count) { return false; }
    virtual bool Construct(const NPVariant *args, uint32_t argCount, NPVariant *result) = 0;
    virtual void InitHandler() {}

protected:
    void AddProperty(PropertyItem& item);
    void AddFunction(FunctionItem& item);

    void set_plugin(PluginBase* plug) { plugin_ = plug; }
    PluginBase* get_plugin() { return plugin_; }

private:
    typedef std::map<std::string, FunctionItem> FunctionMap;
    typedef std::map<std::string, PropertyItem> PropertyMap;
    FunctionMap function_map_;
    PropertyMap property_map_;
    PluginBase* plugin_;

};

#define ON_INVOKEHELPER(_funPtr) \
    static_cast<bool (ScriptObjectBase::*)(const NPVariant *,uint32_t , NPVariant *)>(_funPtr)
#endif
