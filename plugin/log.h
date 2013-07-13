#ifndef LOG_H_
#define LOG_H_

#include <stdio.h>

#ifdef _WINDOWS
#include <windows.h>
#endif

class Log {
public:
    Log(void);
    ~Log(void);

    bool OpenLog(const char* header);
    bool WriteLog(const char* title, const char* contents);
    bool CloseLog();

private:
    FILE* file_;
#ifdef _WINDOWS
    SYSTEMTIME time_;
#endif
};

#endif
