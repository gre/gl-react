LOCAL_PATH:= $(call my-dir)

include $(CLEAR_VARS)
LOCAL_MODULE := libjsc
LOCAL_EXPORT_C_INCLUDES := $(THIRD_PARTY_NDK_DIR)/jsc
include $(BUILD_SHARED_LIBRARY)

include $(CLEAR_VARS)
LOCAL_MODULE := exgl

LOCAL_C_INCLUDES += ../../../../cpp/
LOCAL_SRC_FILES := \
  ../../../../cpp/EXGL.cpp \
  ../../../../cpp/GLImages.cpp \
  ../../../../cpp/EXJSUtils.c \
  ../../../../cpp/EXJSConvertTypedArray.c \
  EXGL.c \
  GLImages.c

# weird hack that lets us mix C++ with -std=c++11 and C with -std=c99
LOCAL_C99_FILES := $(filter %.c, $(LOCAL_SRC_FILES))
TARGET-process-src-files-tags += $(call add-src-files-target-cflags, $(LOCAL_C99_FILES), -std=c99)

LOCAL_ALLOW_UNDEFINED_SYMBOLS := true
LOCAL_SHARED_LIBRARIES := libjsc

include $(BUILD_SHARED_LIBRARY)
