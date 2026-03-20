import React from "react";
import { BookOpenIcon } from "@heroicons/react/24/outline";

export function ApiPage() {
    const apiSections = [
        {
            title: "Surface",
            description: "The main container for WebGL rendering",
            props: [
                { name: "width", type: "number", description: "Width of the surface" },
                { name: "height", type: "number", description: "Height of the surface" },
                { name: "style", type: "object", description: "CSS styles" },
            ],
        },
        {
            title: "Node",
            description: "Renders a shader program into a framebuffer",
            props: [
                { name: "shader", type: "ShaderIdentifier", description: "Shader created with Shaders.create" },
                { name: "uniforms", type: "object", description: "Uniform values for the shader" },
                { name: "width", type: "number", description: "Width in pixels" },
                { name: "height", type: "number", description: "Height in pixels" },
            ],
        },
        {
            title: "Bus",
            description: "Container to cache and re-use content",
            props: [
                { name: "children", type: "ReactNode", description: "Content to render" },
                { name: "uniform", type: "string", description: "Uniform name for parent node" },
                { name: "index", type: "number", description: "Index for multiple buses" },
            ],
        },
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center space-x-3">
                <BookOpenIcon className="h-8 w-8 text-primary-600" />
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">API Documentation</h1>
                    <p className="mt-1 text-gray-600">
                        Complete reference for gl-react components and APIs
                    </p>
                </div>
            </div>

            <div className="space-y-12">
                {apiSections.map((section) => (
                    <div key={section.title} className="card">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            {section.title}
                        </h2>
                        <p className="text-gray-600 mb-6">{section.description}</p>

                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Props</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Description
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {section.props.map((prop) => (
                                        <tr key={prop.name}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {prop.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                                                    {prop.type}
                                                </code>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {prop.description}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}


