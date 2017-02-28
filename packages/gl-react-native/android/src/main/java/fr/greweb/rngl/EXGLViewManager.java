package fr.greweb.rngl;

import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;

import java.util.Map;

import javax.annotation.Nullable;

public class EXGLViewManager extends SimpleViewManager<EXGLView> {
  public static final String REACT_CLASS = "EXGLView";

  @Override
  public String getName() {
    return REACT_CLASS;
  }

  @Override
  public EXGLView createViewInstance(ThemedReactContext context) {
    return new EXGLView(context);
  }

  @Override
  public @Nullable Map getExportedCustomDirectEventTypeConstants() {
    return MapBuilder.of(
            "surfaceCreate",
            MapBuilder.of("registrationName", "onSurfaceCreate"));
  }
}
