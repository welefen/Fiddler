#ifndef CHROME_FIDDLER_SCRIPT_OBJECT_H_
#define CHROME_FIDDLER_SCRIPT_OBJECT_H_

#include "npfunctions.h"
#include "script_object_base.h"

class ChromeFiddlerScriptObject: public ScriptObjectBase {
public:
    ChromeFiddlerScriptObject() {}
    virtual ~ChromeFiddlerScriptObject() {}

    static NPObject* Allocate(NPP npp, NPClass* aClass);

    void Deallocate();
    void Invalidate() {}
    bool Construct(const NPVariant* args, uint32_t argCount, NPVariant* result) { return true; }
    bool OpenFileDialog(const NPVariant* args, uint32_t argCount, NPVariant* result);
    bool GetFilePath(const NPVariant* args, uint32_t argCount, NPVariant* result);
    bool GetFolderPath(const NPVariant* args, uint32_t argCount, NPVariant* result);

    void InitHandler();

private:
    static void InvokeCallback(NPP npp, NPObject* callback, const char* param);

};

#endif    // CHROME_FIDDLER_SCRIPT_OBJECT_H_
