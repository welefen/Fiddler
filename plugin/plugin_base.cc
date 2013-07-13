#include "plugin_base.h"

PluginBase::PluginBase(void) {
}

PluginBase::~PluginBase(void) {
}

NPError PluginBase::Init(NPP instance, uint16_t mode, int16_t argc, char *argn[], char *argv[], NPSavedData *saved) {
    npp_ = instance;
    return NPERR_NO_ERROR;
}

NPError PluginBase::UnInit(NPSavedData** save) {
    return NPERR_NO_ERROR;
}

NPError PluginBase::SetWindow(NPWindow* window) {
    native_window_ = (NativeWindow)window->window;
    return NPERR_NO_ERROR;
}

NPError PluginBase::NewStream(NPMIMEType type, NPStream* stream, NPBool seekable, uint16_t* stype) {
    return NPERR_NO_ERROR;
}

NPError PluginBase::DestroyStream(NPStream* stream, NPReason reason) {
    return NPERR_NO_ERROR;
}

int32_t PluginBase::WriteReady(NPStream* stream) {
    return 0;
}

int32_t PluginBase::Write(NPStream* stream, int32_t offset, int32_t len, void* buffer) {
    return 0;
}

void PluginBase::StreamAsFile(NPStream* stream, const char* fname) {
}

void PluginBase::Print(NPPrint* platformPrint) {
}

int16_t PluginBase::HandleEvent(void* event) {
    return 0;
}

void PluginBase::URLNotify(const char* url, NPReason reason, void* notifyData) {
}

NPError PluginBase::GetValue(NPPVariable variable, void *value) {
    return NPERR_NO_ERROR;
}

NPError PluginBase::SetValue(NPNVariable variable, void *value) {
    return NPERR_NO_ERROR;
}
