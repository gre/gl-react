package fr.greweb.rngl;

import android.graphics.Bitmap;
import android.support.annotation.Nullable;

import com.facebook.common.references.CloseableReference;
import com.facebook.datasource.DataSource;
import com.facebook.drawee.backends.pipeline.Fresco;
import com.facebook.imagepipeline.core.DefaultExecutorSupplier;
import com.facebook.imagepipeline.core.ExecutorSupplier;
import com.facebook.imagepipeline.datasource.BaseBitmapDataSubscriber;
import com.facebook.imagepipeline.image.CloseableImage;
import com.facebook.imagepipeline.memory.PoolConfig;
import com.facebook.imagepipeline.memory.PoolFactory;
import com.facebook.imagepipeline.request.ImageRequest;
import com.facebook.imagepipeline.request.ImageRequestBuilder;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.views.imagehelper.ImageSource;

import java.io.ByteArrayOutputStream;
import java.net.URI;

public class GLImagesModule extends ReactContextBaseJavaModule {

    ExecutorSupplier executorSupplier;

    public GLImagesModule(ReactApplicationContext reactContext) {
        super(reactContext);
        PoolFactory poolFactory = new PoolFactory(PoolConfig.newBuilder().build());
        int numCpuBoundThreads = poolFactory.getFlexByteArrayPoolMaxNumThreads();
        executorSupplier = new DefaultExecutorSupplier(numCpuBoundThreads);
    }


    @Override
    public String getName() {
        return "GLImagesModule";
    }

    @ReactMethod
    public void load (final ReadableMap source, final Integer glAssetId, final Callback cb) {
        ImageSource imageSource = new ImageSource(this.getReactApplicationContext(), source.getString("uri"));

        ImageRequest imageRequest = ImageRequestBuilder
                .newBuilderWithSource(imageSource.getUri())
                .setAutoRotateEnabled(false) // I don't really understand why need to disable this. but it actually fixes the image is properly rotated according to EXIF data
                .build();

        DataSource<CloseableReference<CloseableImage>> pending =
                Fresco.getImagePipeline().fetchDecodedImage(imageRequest, null);

        pending.subscribe(new BaseBitmapDataSubscriber() {
            @Override
            protected void onNewResultImpl(@Nullable Bitmap bitmap) {
                GLImages.set(glAssetId, bitmap);
                cb.invoke(glAssetId, bitmap.getWidth(), bitmap.getHeight());
            }
            @Override
            protected void onFailureImpl(DataSource<CloseableReference<CloseableImage>> dataSource) {

            }
        }, executorSupplier.forDecode());
    }

    @ReactMethod
    public void unload (final Integer glAssetId) {
        GLImages.remove(glAssetId);
    }
}
