import React, { Suspense, useState, useCallback, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/themes/prism-tomorrow.css";
import "../utils/prismGlslTemplate";
import { examples } from "../examples";
import { ControlsPanel, getDefaults } from "../controls";
import { Breadcrumb } from "../components/Breadcrumb";

const sources = import.meta.glob("../examples/*.tsx", { query: "?raw", import: "default", eager: true }) as Record<string, string>;

function getSource(id: string): string | null {
    const key = `../examples/${id}.tsx`;
    return sources[key] ?? null;
}

export function ExampleDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
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
        <div className="space-y-4 relative">
            <Breadcrumb exampleId={example.id} />

            <p className="text-gray-600">{example.description}</p>

            {/* Prev/Next arrows */}
            {prev && (
                <button
                    onClick={() => navigate(`/examples/${prev.id}`)}
                    className="fixed left-2 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/80 hover:bg-white text-gray-400 hover:text-gray-700 shadow border border-gray-200 transition-colors hidden xl:block"
                    title={prev.title}
                >
                    <ChevronLeftIcon className="h-5 w-5" />
                </button>
            )}
            {next && (
                <button
                    onClick={() => navigate(`/examples/${next.id}`)}
                    className="fixed right-2 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/80 hover:bg-white text-gray-400 hover:text-gray-700 shadow border border-gray-200 transition-colors hidden xl:block"
                    title={next.title}
                >
                    <ChevronRightIcon className="h-5 w-5" />
                </button>
            )}

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
