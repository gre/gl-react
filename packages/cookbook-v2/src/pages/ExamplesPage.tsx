import React from "react";
import { Link } from "react-router-dom";
import { BeakerIcon } from "@heroicons/react/24/outline";
import { examples } from "../examples";

const categories = [...new Set(examples.map((e) => e.category))];

export function ExamplesPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Examples</h1>
            </div>

            {categories.map((category) => (
                <div key={category}>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">{category}</h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {examples
                            .filter((e) => e.category === category)
                            .map((example) => (
                                <Link
                                    key={example.id}
                                    to={`/examples/${example.id}`}
                                    className="group relative rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow duration-200"
                                >
                                    <div className="flex items-center space-x-3">
                                        <BeakerIcon className="h-5 w-5 text-primary-600 flex-shrink-0" />
                                        <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary-600">
                                            {example.title}
                                        </h3>
                                    </div>
                                    <p className="mt-2 text-xs text-gray-600">{example.description}</p>
                                </Link>
                            ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
