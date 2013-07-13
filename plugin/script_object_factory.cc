#include "script_object_factory.h"

NPClass ScriptObjectFactory::npclass_ = {
    NP_CLASS_STRUCT_VERSION,
    ScriptObjectFactory::Allocate,
    ScriptObjectFactory::Deallocate,
    ScriptObjectFactory::Invalidate,
    ScriptObjectFactory::HasMethod,
    ScriptObjectFactory::Invoke,
    ScriptObjectFactory::InvokeDefault,
    ScriptObjectFactory::HasProperty,
    ScriptObjectFactory::GetProperty,
    ScriptObjectFactory::SetProperty,
    ScriptObjectFactory::RemoveProperty,
    ScriptObjectFactory::Enumerate,
    ScriptObjectFactory::Construct
};

ScriptObjectFactory::ScriptObjectFactory(void) {
}

ScriptObjectFactory::~ScriptObjectFactory(void) {
}

ScriptObjectBase* ScriptObjectFactory::CreateObject(NPP npp, NPAllocateFunctionPtr allocate) {
    npclass_.allocate = allocate;
    ScriptObjectBase* object = (ScriptObjectBase*)NPN_CreateObject(npp, &npclass_);
    if (object) {
        object->InitHandler();
    }
    return object;
}

NPObject* ScriptObjectFactory::Allocate(NPP npp, NPClass *aClass) {
    return NULL;
}

void ScriptObjectFactory::Deallocate(NPObject *npobj) {
    ScriptObjectBase* pObject = (ScriptObjectBase*)npobj;
    pObject->Deallocate();
}

void ScriptObjectFactory::Invalidate(NPObject *npobj) {
    ScriptObjectBase* pObject = (ScriptObjectBase*)npobj;
    pObject->Invalidate();
}

bool ScriptObjectFactory::HasMethod(NPObject *npobj, NPIdentifier name) {
    ScriptObjectBase* pObject = (ScriptObjectBase*)npobj;
    return pObject->HasMethod(name);
}

bool ScriptObjectFactory::Invoke(NPObject *npobj, NPIdentifier name, const NPVariant *args, uint32_t argCount, NPVariant *result) {
    ScriptObjectBase* pObject = (ScriptObjectBase*)npobj;
    return pObject->Invoke(name, args, argCount, result);
}

bool ScriptObjectFactory::InvokeDefault(NPObject *npobj, const NPVariant *args, uint32_t argCount, NPVariant *result) {
    ScriptObjectBase* pObject = (ScriptObjectBase*)npobj;
    return pObject->InvokeDefault(args, argCount, result);
}

bool ScriptObjectFactory::HasProperty(NPObject *npobj, NPIdentifier name) {
    ScriptObjectBase* pObject = (ScriptObjectBase*)npobj;
    return pObject->HasProperty(name);
}

bool ScriptObjectFactory::GetProperty(NPObject *npobj, NPIdentifier name, NPVariant *result) {
    ScriptObjectBase* pObject = (ScriptObjectBase*)npobj;
    return pObject->GetProperty(name, result);
}

bool ScriptObjectFactory::SetProperty(NPObject *npobj, NPIdentifier name, const NPVariant *value) {
    ScriptObjectBase* pObject = (ScriptObjectBase*)npobj;
    return pObject->SetProperty(name, value);
}

bool ScriptObjectFactory::RemoveProperty(NPObject *npobj, NPIdentifier name) {
    ScriptObjectBase* pObject = (ScriptObjectBase*)npobj;
    return pObject->RemoveProperty(name);
}

bool ScriptObjectFactory::Enumerate(NPObject *npobj, NPIdentifier **value, uint32_t *count) {
    ScriptObjectBase* pObject = (ScriptObjectBase*)npobj;
    return pObject->Enumerate(value, count);
}

bool ScriptObjectFactory::Construct(NPObject *npobj, const NPVariant *args, uint32_t argCount, NPVariant *result) {
    ScriptObjectBase* pObject = (ScriptObjectBase*)npobj;
    return pObject->Construct(args, argCount, result);
}