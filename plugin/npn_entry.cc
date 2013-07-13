#include "npfunctions.h"

NPNetscapeFuncs* g_npn_funcs;

void NP_LOADDS NPN_Version(int* plugin_major, int* plugin_minor, int* netscape_major, int* netscape_minor) {
    *plugin_major = 1;
    *plugin_minor = 1;
    *netscape_major = g_npn_funcs->version >> 8;
    *netscape_minor = g_npn_funcs->version & 0x00FF;
}

NPError NP_LOADDS NPN_GetURLNotify(NPP instance, const char* url, const char* target, void* notifyData) {
    return g_npn_funcs->geturlnotify(instance, url, target, notifyData);
}

NPError NP_LOADDS NPN_GetURL(NPP instance,const char* url,const char* target) {
    return g_npn_funcs->geturl(instance, url, target);
}

NPError NP_LOADDS NPN_PostURLNotify(NPP instance, const char* url, const char* target, uint32_t len, const char* buf, NPBool file, void* notifyData) {
    return g_npn_funcs->posturlnotify(instance, url, target, len, buf, file, notifyData);
}

NPError NP_LOADDS NPN_PostURL(NPP instance, const char* url,const char* target, uint32_t len,const char* buf, NPBool file) {
    return g_npn_funcs->posturl(instance, url, target, len, buf, file);
}

NPError NP_LOADDS NPN_RequestRead(NPStream* stream, NPByteRange* rangeList) {
    return g_npn_funcs->requestread(stream, rangeList);
}

NPError NP_LOADDS NPN_NewStream(NPP instance, NPMIMEType type, const char* target, NPStream** stream) {
    return g_npn_funcs->newstream(instance, type, target, stream);
}

int32_t NP_LOADDS NPN_Write(NPP instance, NPStream* stream, int32_t len, void* buffer) {
    return g_npn_funcs->write(instance, stream, len, buffer);
}

NPError NP_LOADDS NPN_DestroyStream(NPP instance, NPStream* stream, NPReason reason) {
    return g_npn_funcs->destroystream(instance, stream, reason);
}

void NP_LOADDS NPN_Status(NPP instance, const char* message) {
    g_npn_funcs->status(instance, message);
}

const char* NP_LOADDS NPN_UserAgent(NPP instance) {
    return g_npn_funcs->uagent(instance);
}

void* NP_LOADDS NPN_MemAlloc(uint32_t size) {
    return g_npn_funcs->memalloc(size);
}

void NP_LOADDS NPN_MemFree(void* ptr) {
    return g_npn_funcs->memfree(ptr);
}

uint32_t NP_LOADDS NPN_MemFlush(uint32_t size) {
    return g_npn_funcs->memflush(size);
}

void NP_LOADDS NPN_ReloadPlugins(NPBool reloadPages) {
    g_npn_funcs->reloadplugins(reloadPages);
}

NPError NP_LOADDS NPN_GetValue(NPP instance, NPNVariable variable, void *value) {
    return g_npn_funcs->getvalue(instance, variable, value);
}

NPError NP_LOADDS NPN_SetValue(NPP instance, NPPVariable variable, void *value) {
    return g_npn_funcs->setvalue(instance, variable, value);
}

void NP_LOADDS NPN_InvalidateRect(NPP instance, NPRect *invalidRect) {
    g_npn_funcs->invalidaterect(instance, invalidRect);
}

void NP_LOADDS NPN_InvalidateRegion(NPP instance, NPRegion invalidRegion) {
    g_npn_funcs->invalidateregion(instance, invalidRegion);
}

void NP_LOADDS NPN_ForceRedraw(NPP instance) {
    g_npn_funcs->forceredraw(instance);
}

void NP_LOADDS NPN_PushPopupsEnabledState(NPP instance, NPBool enabled) {
    g_npn_funcs->pushpopupsenabledstate(instance, enabled);
}

void NP_LOADDS NPN_PopPopupsEnabledState(NPP instance) {
    g_npn_funcs->poppopupsenabledstate(instance);
}
void NP_LOADDS NPN_PluginThreadAsyncCall(NPP instance,void (*func) (void *), void *userData) {
    g_npn_funcs->pluginthreadasynccall(instance, func, userData);
}

NPError NP_LOADDS NPN_GetValueForURL(NPP instance, NPNURLVariable variable, const char *url, char **value, uint32_t *len) {
    return g_npn_funcs->getvalueforurl(instance, variable, url, value, len);
}

NPError NP_LOADDS NPN_SetValueForURL(NPP instance, NPNURLVariable variable, const char *url, const char *value, uint32_t len) {
    return g_npn_funcs->setvalueforurl(instance, variable, url, value, len);
}
NPError NP_LOADDS NPN_GetAuthenticationInfo(NPP instance, const char *protocol, const char *host, int32_t port, const char *scheme, const char *realm, char **username, uint32_t *ulen, char **password, uint32_t *plen) {
    return g_npn_funcs->getauthenticationinfo(instance, protocol, host, port, scheme, realm, username, ulen, password, plen);
}

NPObject *NPN_CreateObject(NPP npp, NPClass *aClass) {
    return g_npn_funcs->createobject(npp, aClass);
}

NPObject *NPN_RetainObject(NPObject *npobj) {
    return g_npn_funcs->retainobject(npobj);
}

void NPN_ReleaseObject(NPObject *npobj) {
    g_npn_funcs->releaseobject(npobj);
}

bool NPN_Invoke(NPP npp, NPObject *npobj, NPIdentifier methodName, const NPVariant *args, uint32_t argCount, NPVariant *result) {
    return g_npn_funcs->invoke(npp, npobj, methodName, args, argCount, result);
}

bool NPN_InvokeDefault(NPP npp, NPObject *npobj, const NPVariant *args, uint32_t argCount, NPVariant *result) {
    return g_npn_funcs->invokeDefault(npp, npobj, args, argCount, result);
}

bool NPN_Evaluate(NPP npp, NPObject *npobj, NPString *script, NPVariant *result) {
    return g_npn_funcs->evaluate(npp, npobj, script, result);
}

bool NPN_GetProperty(NPP npp, NPObject *npobj, NPIdentifier propertyName, NPVariant *result) {
    return g_npn_funcs->getproperty(npp, npobj, propertyName, result);
}

bool NPN_SetProperty(NPP npp, NPObject *npobj, NPIdentifier propertyName, const NPVariant *value) {
    return g_npn_funcs->setproperty(npp, npobj, propertyName, value);
}

bool NPN_RemoveProperty(NPP npp, NPObject *npobj, NPIdentifier propertyName) {
    return g_npn_funcs->removeproperty(npp, npobj, propertyName);
}

bool NPN_HasProperty(NPP npp, NPObject *npobj, NPIdentifier propertyName) {
    return g_npn_funcs->hasproperty(npp, npobj, propertyName);
}

bool NPN_HasMethod(NPP npp, NPObject *npobj, NPIdentifier methodName) {
    return g_npn_funcs->hasmethod(npp, npobj, methodName);
}

bool NPN_Enumerate(NPP npp, NPObject *npobj, NPIdentifier **identifier, uint32_t *count) {
    return g_npn_funcs->enumerate(npp, npobj, identifier, count);
}

bool NPN_Construct(NPP npp, NPObject *npobj, const NPVariant *args, uint32_t argCount, NPVariant *result) {
    return g_npn_funcs->construct(npp, npobj, args, argCount, result);
}

void NPN_SetException(NPObject *npobj, const NPUTF8 *message) {
    g_npn_funcs->setexception(npobj, message);
}

NPIdentifier NPN_GetStringIdentifier(const NPUTF8 *name) {
    return g_npn_funcs->getstringidentifier(name);
}

void NPN_GetStringIdentifiers(const NPUTF8 **names, int32_t nameCount, NPIdentifier *identifiers) {
    g_npn_funcs->getstringidentifiers(names, nameCount, identifiers);
}

NPIdentifier NPN_GetIntIdentifier(int32_t intid) {
    return g_npn_funcs->getintidentifier(intid);
}

bool NPN_IdentifierIsString(NPIdentifier identifier) {
    return g_npn_funcs->identifierisstring(identifier);
}

NPUTF8 *NPN_UTF8FromIdentifier(NPIdentifier identifier) {
    return g_npn_funcs->utf8fromidentifier(identifier);
}

int32_t NPN_IntFromIdentifier(NPIdentifier identifier) {
    return g_npn_funcs->intfromidentifier(identifier);
}

void NPN_ReleaseVariantValue(NPVariant *variant) {
    g_npn_funcs->releasevariantvalue(variant);
}
