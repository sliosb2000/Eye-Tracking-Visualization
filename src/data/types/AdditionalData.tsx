import { VisualizationType } from "../Data";

export const AdditionalDataVisualizationTypeMap = new Map<number, string>([
	[1, "graph"],
	[2, "tree"],
]);

export interface AdditionalData {
	participantId: string;
	ontology: Ontologies;
	visualization: VisualizationType;
	success: number;
}

export enum Ontologies {
  CONFERENCE = 1,
  BIOMEDICAL = 2,
}

export const ontologyMap = new Map<Ontologies, string>([
	[Ontologies.CONFERENCE, "Conference"],
	[Ontologies.BIOMEDICAL, "Biomedical"],
]);