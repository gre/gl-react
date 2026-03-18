import React, { Suspense, useState, useCallback, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/themes/prism-tomorrow.css";
import { examples } from "../examples";
import { ControlsPanel, getDefaults } from "../controls";

const sources = import.meta.glob("../examples/*.tsx", { query: "?raw", import: "default", eager: true }) as Record<string, string>;

function getSource(id: string): string | null {
    const key = `../examples/${id}.tsx`;
    return sources[key] ?? null;
}

export function ExampleDetailPage() {
    const { id } = useParams<{ id: string }>();
    const exampleIndex = examples.findIndex((e) => e.id === id);
    const example = exampleIndex >= 0 ? examples[exampleIndex] : undefined;
    const prev = exampleIndex > 0 ? examples[exampleIndex - 1] : null;
    const next = exampleIndex < examples.length - 1 ? examples[exampleIndex + 1] : null;

    const [controlValues, setControlValues] = useState<Record<string, any>>(() =>
        example?.controls ? getDefaults(example.controls) : {}
    );

    const onControlChange = useCallback((key: string, value: any) => {
        setControlValues((prev) => ({ ...prev, [key]: value }));
    }, []);

    if (!example) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900">Example not found</h2>
                <Link to="/examples" className="mt-4 text-primary-600 hover:underline">
                    Back to examples
                </Link>
            </div>
        );
    }

    const hasControls = example.controls && Object.keys(example.controls).length > 0;
    const source = getSource(example.id);
    const highlightedSource = useMemo(
        () => source ? Prism.highlight(source, Prism.languages.tsx, "tsx") : null,
        [source]
    );

    return (
        <div className="space-y-4">
            {/* Nav */}
            <div className="flex items-center justify-between">
                <Link
                    to="/examples"
                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                >
                    <ArrowLeftIcon className="h-4 w-4 mr-1" />
                    Back
                </Link>
                <div className="flex items-center gap-2">
                    {prev ? (
                        <Link
                            to={`/examples/${prev.id}`}
                            className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-md hover:bg-gray-50"
                            title={prev.title}
                        >
                            <ChevronLeftIcon className="h-4 w-4 mr-1" />
                            prev
                        </Link>
                    ) : (
                        <span className="inline-flex items-center px-3 py-1.5 text-sm text-gray-300 border border-gray-100 rounded-md">
                            <ChevronLeftIcon className="h-4 w-4 mr-1" />
                            prev
                        </span>
                    )}
                    {next ? (
                        <Link
                            to={`/examples/${next.id}`}
                            className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-md hover:bg-gray-50"
                            title={next.title}
                        >
                            next
                            <ChevronRightIcon className="h-4 w-4 ml-1" />
                        </Link>
                    ) : (
                        <span className="inline-flex items-center px-3 py-1.5 text-sm text-gray-300 border border-gray-100 rounded-md">
                            next
                            <ChevronRightIcon className="h-4 w-4 ml-1" />
                        </span>
                    )}
                </div>
            </div>

            {/* Title */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{example.title}</h1>
                <p className="mt-1 text-gray-600">{example.description}</p>
            </div>

            {/* Main layout: side-by-side on wide screens */}
            <div className="flex flex-col xl:flex-row gap-6">
                {/* Left: canvas + controls */}
                <div className="flex-shrink-0 space-y-4">
                    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                        <Suspense
                            fallback={
                                <div className="flex items-center justify-center h-64 text-gray-400">
                                    Loading example...
                                </div>
                            }
                        >
                            <example.Component {...controlValues} />
                        </Suspense>
                    </div>

                    {hasControls && (
                        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Controls</h3>
                            <ControlsPanel
                                controls={example.controls!}
                                values={controlValues}
                                onChange={onControlChange}
                            />
                        </div>
                    )}
                </div>

                {/* Right: source code */}
                {highlightedSource && (
                    <div className="flex-1 min-w-0">
                        <div className="bg-[#2d2d2d] rounded-lg p-4 overflow-x-auto h-full max-h-[80vh] overflow-y-auto">
                            <pre className="text-xs font-mono leading-relaxed !bg-transparent !m-0 !p-0">
                                <code
                                    className="language-tsx"
                                    dangerouslySetInnerHTML={{ __html: highlightedSource }}
                                />
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
