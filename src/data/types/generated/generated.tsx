export interface Generated {
    description: string;
    value: number;
}

export const DescriptionUnitMap = new Map<string, string>([
    ["mean duration", "ms"],
    ["mean saccade length", "mm"],
    ["mean saccade duration", "ms"],
    ["scanpath duration", "ms"],
    ["fixation to saccade ratio", ""],
    ["mean absolute degree", "°"],
    ["mean relative degree", "°"],
    ["convex hull area", "mm^2"]
]);