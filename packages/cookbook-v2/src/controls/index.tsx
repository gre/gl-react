import React from "react";

// --- Control type definitions ---

export type FloatControl = {
  type: "float";
  label: string;
  min?: number;
  max?: number;
  step?: number;
  default: number;
};

export type ColorControl = {
  type: "color";
  label: string;
  default: [number, number, number];
};

export type SelectControl = {
  type: "select";
  label: string;
  options: { key: string; label: string }[];
  default: string;
};

export type TextAreaControl = {
  type: "textarea";
  label: string;
  default: string;
};

export type ImagePickerControl = {
  type: "images";
  label: string;
  images: string[];
  default: string;
};

export type ControlDef =
  | FloatControl
  | ColorControl
  | SelectControl
  | TextAreaControl
  | ImagePickerControl;

export type ControlsMap = Record<string, ControlDef>;

// --- Infer values type from controls map ---

export type ControlValues<T extends ControlsMap> = {
  [K in keyof T]: T[K] extends FloatControl
    ? number
    : T[K] extends ColorControl
      ? [number, number, number]
      : T[K] extends SelectControl
        ? string
        : T[K] extends TextAreaControl
          ? string
          : T[K] extends ImagePickerControl
            ? string
            : never;
};

// --- Extract defaults ---

export function getDefaults<T extends ControlsMap>(controls: T): ControlValues<T> {
  const result: any = {};
  for (const [key, def] of Object.entries(controls)) {
    result[key] = def.default;
  }
  return result;
}

// --- Control UI components ---

function FloatSlider({
  def,
  value,
  onChange,
}: {
  def: FloatControl;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
        min={def.min ?? 0}
        max={def.max ?? 1}
        step={def.step ?? 0.01}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      <span className="text-xs text-gray-500 w-12 text-right font-mono">
        {value.toFixed(2)}
      </span>
    </div>
  );
}

function vec3ToHex([r, g, b]: [number, number, number]): string {
  const toHex = (v: number) =>
    Math.round(v * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToVec3(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
}

function ColorPicker({
  value,
  onChange,
}: {
  def: ColorControl;
  value: [number, number, number];
  onChange: (v: [number, number, number]) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        className="w-10 h-8 rounded cursor-pointer border border-gray-300"
        value={vec3ToHex(value)}
        onChange={(e) => onChange(hexToVec3(e.target.value))}
      />
      <span className="text-xs text-gray-500 font-mono">
        [{value.map((v) => v.toFixed(2)).join(", ")}]
      </span>
    </div>
  );
}

function SelectInput({
  def,
  value,
  onChange,
}: {
  def: SelectControl;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      className="block w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {def.options.map((opt) => (
        <option key={opt.key} value={opt.key}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function TextAreaInput({
  def,
  value,
  onChange,
}: {
  def: TextAreaControl;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <textarea
      className="block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 font-mono text-xs text-gray-900"
      rows={6}
      spellCheck={false}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function ImagePicker({
  def,
  value,
  onChange,
}: {
  def: ImagePickerControl;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {def.images.map((src) => (
        <img
          key={src}
          alt=""
          src={src}
          className={`w-16 h-12 object-cover rounded cursor-pointer border-2 ${
            src === value ? "border-primary-600" : "border-transparent"
          }`}
          onClick={() => onChange(src)}
        />
      ))}
    </div>
  );
}

// --- Main controls panel ---

export function ControlsPanel({
  controls,
  values,
  onChange,
}: {
  controls: ControlsMap;
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
}) {
  return (
    <div className="space-y-4">
      {Object.entries(controls).map(([key, def]) => (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {def.label}
          </label>
          {def.type === "float" && (
            <FloatSlider
              def={def}
              value={values[key]}
              onChange={(v) => onChange(key, v)}
            />
          )}
          {def.type === "color" && (
            <ColorPicker
              def={def}
              value={values[key]}
              onChange={(v) => onChange(key, v)}
            />
          )}
          {def.type === "select" && (
            <SelectInput
              def={def}
              value={values[key]}
              onChange={(v) => onChange(key, v)}
            />
          )}
          {def.type === "textarea" && (
            <TextAreaInput
              def={def}
              value={values[key]}
              onChange={(v) => onChange(key, v)}
            />
          )}
          {def.type === "images" && (
            <ImagePicker
              def={def}
              value={values[key]}
              onChange={(v) => onChange(key, v)}
            />
          )}
        </div>
      ))}
    </div>
  );
}
