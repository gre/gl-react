import React from 'react'
import { Link } from 'react-router-dom'
import { AnimatedWebGLExample } from '../components/WebGLExample'

export function HomePage() {
    return (
        <div className="space-y-12">
            <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                    GL React Cookbook
                </h1>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                    <Link
                        to="/examples"
                        className="btn btn-primary text-lg px-8 py-3"
                    >
                        Explore Examples
                    </Link>
                </div>
            </div>

            <div className="flex justify-center">
                <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg blur opacity-25"></div>
                    <div className="relative bg-white rounded-lg shadow-lg overflow-hidden leading-[0]">
                        <AnimatedWebGLExample width={400} height={400} />
                    </div>
                </div>
            </div>
        </div>
    )
}
