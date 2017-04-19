package fr.greweb.rngl;

import android.graphics.Bitmap;
import com.facebook.soloader.SoLoader;

// Java bindings for GLImages
public class GLImages {
    public static native void set(int glAssetId, Bitmap bitmap);
    public static native void remove(int glAssetId);
}
