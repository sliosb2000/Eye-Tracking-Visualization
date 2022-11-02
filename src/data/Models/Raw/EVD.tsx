
export enum EVDEventKey {
	SLOW_SLIDE = 4,
	HIDE_SLIDE = 5,
	KEYBOARD = 3,
	L_MOUSE_BUTTON = 1,
	R_MOUSE_BUTTON = 2,
}

export const EVDEventKeyItems: {
	[key in EVDEventKey]: Array<[keyof EVD, string]>;
} = {
	[EVDEventKey.SLOW_SLIDE]: [["data1", "number"], ["description", "string"]],
	[EVDEventKey.HIDE_SLIDE]: [["data1", "number"], ["description", "string"]],
	[EVDEventKey.KEYBOARD]: [["data1", "number"], ["data2", "number"], ["description", "string"]],
	[EVDEventKey.L_MOUSE_BUTTON]: [["data1", "number"], ["data2", "number"]],
	[EVDEventKey.R_MOUSE_BUTTON]: [["data1", "number"], ["data2", "number"]],
}

interface LooseObject {
	[key: string]: any;
}

export interface EVD extends LooseObject {
	time: number;
	event: string;
	eventKey: number;
	data1?: number;
	data2?: number;
	description?: string;
}