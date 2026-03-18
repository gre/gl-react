import React, { useState, useRef, useEffect } from "react";
import {
    EyeIcon,
    EyeSlashIcon,
    AdjustmentsHorizontalIcon,
    CodeBracketIcon,
    XMarkIcon
} from "@heroicons/react/24/outline";

interface InspectorProps {
    children: React.ReactNode;
    title?: string;
    showInspector?: boolean;
    onToggleInspector?: () => void;
}

export function Inspector({
    children,
    title = "WebGL Inspector",
    showInspector = false,
    onToggleInspector
}: InspectorProps) {
    const [isOpen, setIsOpen] = useState(showInspector);
    const [uniforms, setUniforms] = useState<Record<string, any>>({});
    const [shaderInfo, setShaderInfo] = useState<any>(null);
    const inspectorRef = useRef<HTMLDivElement>(null);

    const toggleInspector = () => {
        const newState = !isOpen;
        setIsOpen(newState);
        onToggleInspector?.(newState);
    };

    // Mock shader info - in a real implementation, this would come from the WebGL context
    useEffect(() => {
        setShaderInfo({
            vertexShader: `
        attribute vec4 position;
        void main() {
          gl_Position = position;
        }
      `,
            fragmentShader: `
        precision mediump float;
        uniform float time;
        uniform vec2 resolution;
        
        void main() {
          vec2 uv = gl_FragCoord.xy / resolution.xy;
          vec3 color = 0.5 + 0.5 * cos(time + uv.xyx + vec3(0, 2, 4));
          gl_FragColor = vec4(color, 1.0);
        }
      `,
            uniforms: {
                time: { type: "float", value: 0 },
                resolution: { type: "vec2", value: [400, 400] }
            }
        });
    }, []);

    return (
        <div className="relative">
            {/* Main content */}
            <div className="relative">
                {children}

                {/* Inspector toggle button */}
                <button
                    onClick={toggleInspector}
                    className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-lg shadow-lg transition-colors duration-200"
                    title={isOpen ? "Hide Inspector" : "Show Inspector"}
                >
                    {isOpen ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-600" />
                    ) : (
                        <EyeIcon className="h-5 w-5 text-gray-600" />
                    )}
                </button>
            </div>

            {/* Inspector panel */}
            {isOpen && (
                <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-gray-200 z-50 overflow-y-auto">
                    <div className="p-6">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-2">
                                <AdjustmentsHorizontalIcon className="h-6 w-6 text-primary-600" />
                                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                            </div>
                            <button
                                onClick={toggleInspector}
                                className="p-1 hover:bg-gray-100 rounded"
                            >
                                <XMarkIcon className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Shader Info */}
                        {shaderInfo && (
                            <div className="space-y-6">
                                {/* Uniforms */}
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900 mb-3">Uniforms</h3>
                                    <div className="space-y-3">
                                        {Object.entries(shaderInfo.uniforms).map(([name, uniform]: [string, any]) => (
                                            <div key={name} className="bg-gray-50 rounded-lg p-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-gray-900">{name}</span>
                                                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                                                        {uniform.type}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-600 font-mono">
                                                    {Array.isArray(uniform.value)
                                                        ? `[${uniform.value.join(", ")}]`
                                                        : uniform.value.toString()
                                                    }
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Fragment Shader */}
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                                        <CodeBracketIcon className="h-4 w-4 mr-2" />
                                        Fragment Shader
                                    </h3>
                                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                                        <pre className="text-xs text-gray-100 font-mono">
                                            <code>{shaderInfo.fragmentShader}</code>
                                        </pre>
                                    </div>
                                </div>

                                {/* Vertex Shader */}
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                                        <CodeBracketIcon className="h-4 w-4 mr-2" />
                                        Vertex Shader
                                    </h3>
                                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                                        <pre className="text-xs text-gray-100 font-mono">
                                            <code>{shaderInfo.vertexShader}</code>
                                        </pre>
                                    </div>
                                </div>

                                {/* Performance Info */}
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900 mb-3">Performance</h3>
                                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Draw Calls:</span>
                                            <span className="font-mono">1</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Vertices:</span>
                                            <span className="font-mono">4</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">FPS:</span>
                                            <span className="font-mono text-green-600">60</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}


