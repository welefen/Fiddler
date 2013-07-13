#ifndef SCRIPT_OBJECT_FACTORY_H_
#define SCRIPT_OBJECT_FACTORY_H_

#include "script_object_base.h"

class ScriptObjectFactory {
public:
    ScriptObjectFactory(void);
    ~ScriptObjectFactory(void);

    static ScriptObjectBase* CreateObject(NPP npp, NPAllocateFunctionPtr allocate);

private:
    static NPObject* Allocate(NPP npp, NPClass *aClass);
    static void Deallocate(NPObject *npobj);
    static void Invalidate(NPObject *npobj);
    static bool HasMethod(NPObject *npobj, NPIdentifier name);
    static bool Invoke(NPObject *npobj, NPIdentifier name, const NPVariant *args, uint32_t argCount, NPVariant *result);
    static bool InvokeDefault(NPObject *npobj, const NPVariant *args, uint32_t argCount, NPVariant *result);
    static bool HasProperty(NPObject *npobj, NPIdentifier name);
    static bool GetProperty(NPObject *npobj, NPIdentifier name, NPVariant *result);
    static bool SetProperty(NPObject *npobj, NPIdentifier name, const NPVariant *value);
    static bool RemoveProperty(NPObject *npobj, NPIdentifier name);
    static bool Enumerate(NPObject *npobj, NPIdentifier **value, uint32_t *count);
    static bool Construct(NPObject *npobj, const NPVariant *args, uint32_t argCount, NPVariant *result);

private:
    static NPClass npclass_;
};

#endif    // SCRIPT_OBJECT_FACTORY_H_