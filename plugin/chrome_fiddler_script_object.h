#ifndef CHROME_FIDDLER_SCRIPT_OBJECT_H_
#define CHROME_FIDDLER_SCRIPT_OBJECT_H_

#ifdef GTK
#include <gtk/gtk.h>
#include <sys/types.h>
#endif

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

    void InitHandler();

};

#endif    // CHROME_FIDDLER_SCRIPT_OBJECT_H_
