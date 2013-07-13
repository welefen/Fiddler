#include "script_object_base.h"
#include "utils.h"

bool ScriptObjectBase::HasMethod(NPIdentifier name) {
    bool ret = false;
    utils::IdentifiertoString method_name(name);
    if (method_name.identifier_name()) {
        FunctionMap::iterator iter = function_map_.find((const char*)method_name);
        ret = iter != function_map_.end();
    }
    return ret;
}

bool ScriptObjectBase::Invoke(NPIdentifier name,const NPVariant *args, uint32_t argCount,NPVariant *result) {
    bool ret = false;
    utils::IdentifiertoString method_name(name);
    if (method_name.identifier_name()) {
        FunctionMap::iterator iter = function_map_.find((const char*)method_name);
        if (iter != function_map_.end())
            ret = (this->*(iter->second.function_pointer))(args, argCount, result);
    }
    return ret;
}

bool ScriptObjectBase::HasProperty(NPIdentifier name) {
    bool ret = false;
    utils::IdentifiertoString property_name(name);
    if (property_name.identifier_name()) {
        PropertyMap::iterator iter = property_map_.find((const char*)property_name);
        ret = iter != property_map_.end();
    }
    return ret;
}

bool ScriptObjectBase::GetProperty(NPIdentifier name, NPVariant *result) {
    bool ret = false;
    utils::IdentifiertoString property_name(name);
    if (property_name.identifier_name()) {
        PropertyMap::iterator iter = property_map_.find((const char*)property_name);
        if (iter != property_map_.end()) {
            *result = iter->second.property_value;
            ret = true;
        }
    }
    return ret;
}

bool ScriptObjectBase::SetProperty(NPIdentifier name, const NPVariant *value) {
    bool ret = false;
    utils::IdentifiertoString property_name(name);
    if (property_name.identifier_name()) {
        PropertyMap::iterator iter = property_map_.find((const char*)property_name);
        if (iter != property_map_.end()) {
            iter->second.property_value = *value;
            ret = true;
        }
    }
    return ret;
}
bool ScriptObjectBase::RemoveProperty(NPIdentifier name) {
    bool ret = false;
    utils::IdentifiertoString property_name(name);
    if (property_name.identifier_name()) {
        PropertyMap::iterator iter = property_map_.find((const char*)property_name);
        if (iter != property_map_.end()) {
            property_map_.erase(iter);
            ret = true;
        }
    }
    return ret;
}

void ScriptObjectBase::AddProperty(PropertyItem& item) {
    PropertyMap::iterator iter = property_map_.find(item.property_name);
    if (iter != property_map_.end())
        return;

    property_map_.insert(PropertyMap::value_type(item.property_name, item));
}

void ScriptObjectBase::AddFunction(FunctionItem& item) {
    FunctionMap::iterator iter = function_map_.find(item.function_name);
    if (iter != function_map_.end())
        return;

    function_map_.insert(FunctionMap::value_type(item.function_name, item));
}
