#ifndef UTIL_H_
#define UTIL_H_

#ifdef _WINDOWS
#include <windows.h>
#endif

#include "npfunctions.h"

namespace utils {

class IdentifiertoString {
public:
    explicit IdentifiertoString(NPIdentifier identifier) : identifier_name_(NULL) {
        identifier_name_ = NPN_UTF8FromIdentifier(identifier);
    }
    const char* identifier_name() const { return identifier_name_; }
    operator const char*() const { return identifier_name_; }
    ~IdentifiertoString() { if (identifier_name_) NPN_MemFree(identifier_name_); }

private:
    // Disable evil constructors.
    IdentifiertoString();
    IdentifiertoString(const IdentifiertoString&);

    char* identifier_name_;
};

#ifdef _WINDOWS
class Utf8ToUnicode {
public:
    explicit Utf8ToUnicode(const char* utf8data, unsigned int datalen = -1) : buffer_(NULL) {
        int size = MultiByteToWideChar(CP_UTF8, 0, utf8data, datalen, 0, 0);
        if (size > 0)
            buffer_ = new WCHAR[size + 1];
        if (buffer_) {
            MultiByteToWideChar(CP_UTF8, 0, utf8data, datalen, buffer_, size);
            buffer_[size] = 0;
        }
    }
    operator WCHAR*() const { return buffer_; }
    WCHAR** operator &() { return &buffer_; }
    ~Utf8ToUnicode() { if (buffer_) delete[] buffer_; }

private:
    Utf8ToUnicode();
    Utf8ToUnicode(const Utf8ToUnicode&);
    WCHAR* buffer_;
};
#endif

}

#endif
