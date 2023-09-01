/** You probably want to use the types from api-types.ts instead. */
/* eslint-disable */
import {
  Author,
  BodyCreateFile_ProjectId__Filepath_Put,
  ChatRequest,
  ChatResponse,
  ChatResponseChoice,
  Chunk,
  DeleteRequest,
  DeleteStatusResponse,
  EmptyRequest,
  FileEntry,
  FlatSettingsSchema,
  FlatSettingsSchemaPatch,
  FolderEntry,
  HTTPValidationError,
  IngestResponse,
  IngestStatus,
  ProjectCreateRequest,
  ProjectDetailsResponse,
  ProjectFileTreeResponse,
  Reference,
  ReferencePatch,
  ResponseStatus,
  RewriteChoice,
  RewriteMannerType,
  RewriteRequest,
  RewriteResponse,
  S2SearchResult,
  SearchResponse,
  TextCompletionChoice,
  TextCompletionRequest,
  TextCompletionResponse,
  UpdateStatusResponse,
  ValidationError,
} from './api-types';

/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
  '/api/ai/{project_id}/chat': {
    /** Http Ai Chat */
    post: operations['http_ai_chat__project_id__chat_post'];
  };
  '/api/ai/completion': {
    /** Http Ai Completion */
    post: operations['http_ai_completion_completion_post'];
  };
  '/api/ai/rewrite': {
    /** Http Ai Rewrite */
    post: operations['http_ai_rewrite_rewrite_post'];
  };
  '/api/fs/{project_id}/{filepath}': {
    /** Read File */
    get: operations['read_file__project_id___filepath__get'];
    /** Create File */
    put: operations['create_file__project_id___filepath__put'];
    /** Delete File */
    delete: operations['delete_file__project_id___filepath__delete'];
    /** Head File */
    head: operations['head_file__project_id___filepath__head'];
  };
  '/api/meta/shutdown': {
    /** Shutdown */
    post: operations['shutdown_shutdown_post'];
  };
  '/api/meta/status': {
    /** Status */
    get: operations['status_status_get'];
  };
  '/api/projects/': {
    /**
     * List Projects
     * @description Returns a list of projects for the current user
     */
    get: operations['list_projects__get'];
    /**
     * Create Project
     * @description Creates a project, and a directory in the filesystem
     */
    post: operations['create_project__post'];
  };
  '/api/projects/{project_id}': {
    /**
     * Get Project
     * @description Returns details about a project
     */
    get: operations['get_project__project_id__get'];
    /**
     * Delete Project
     * @description Deletes a project directory and all files in it
     */
    delete: operations['delete_project__project_id__delete'];
  };
  '/api/projects/{project_id}/files': {
    /** Get Project Files */
    get: operations['get_project_files__project_id__files_get'];
  };
  '/api/references/{project_id}': {
    /**
     * List References
     * @description Returns a list of references for the current user
     */
    get: operations['list_references__project_id__get'];
    /**
     * Ingest References
     * @description Ingests references from PDFs in the project uploads directory
     */
    post: operations['ingest_references__project_id__post'];
  };
  '/api/references/{project_id}/{reference_id}': {
    /** Http Get */
    get: operations['http_get__project_id___reference_id__get'];
    /** Http Delete */
    delete: operations['http_delete__project_id___reference_id__delete'];
    /** Http Update */
    patch: operations['http_update__project_id___reference_id__patch'];
  };
  '/api/references/{project_id}/bulk_delete': {
    /** Http Bulk Delete */
    post: operations['http_bulk_delete__project_id__bulk_delete_post'];
  };
  '/api/search/s2': {
    /** Http Search S2 */
    get: operations['http_search_s2_s2_get'];
  };
  '/api/settings/': {
    /** Get Settings */
    get: operations['get_settings__get'];
    /** Update Settings */
    put: operations['update_settings__put'];
  };
}

export type webhooks = Record<string, never>;

export interface components {
  schemas: {
    /** Author */
    Author: {
      email?: string;
      full_name: string;
      given_name?: string;
      surname?: string;
    };
    /** Body_create_file__project_id___filepath__put */
    Body_create_file__project_id___filepath__put: {
      /**
       * File
       * Format: binary
       */
      file: string;
    };
    /** ChatRequest */
    ChatRequest: {
      /** @default 1 */
      n_choices?: number;
      /** @default 0.7 */
      temperature?: number;
      text: string;
    };
    /** ChatResponse */
    ChatResponse: {
      choices: ChatResponseChoice[];
      message: string;
      status: ResponseStatus;
    };
    /** ChatResponseChoice */
    ChatResponseChoice: {
      index: number;
      text: string;
    };
    /** Chunk */
    Chunk: {
      /** @default {} */
      metadata?: Record<string, never>;
      text: string;
      /** @default [] */
      vector?: number[];
    };
    /** DeleteRequest */
    DeleteRequest: {
      /** @default false */
      all?: boolean;
      reference_ids: string[];
    };
    /** DeleteStatusResponse */
    DeleteStatusResponse: {
      message: string;
      status: ResponseStatus;
    };
    /**
     * EmptyRequest
     * @description Use this to indicate that a request only accepts an empty object ({})
     */
    EmptyRequest: Record<string, never>;
    /** FileEntry */
    FileEntry: {
      file_extension: string;
      name: string;
      path: string;
    };
    /** FlatSettingsSchema */
    FlatSettingsSchema: {
      active_project_id: string;
      current_directory: string;
      logging_enabled: boolean;
      logging_filepath: string;
      openai_api_key: string;
      openai_chat_model: string;
      openai_manner: RewriteMannerType;
      openai_temperature: number;
    };
    /** FlatSettingsSchemaPatch */
    FlatSettingsSchemaPatch: {
      active_project_id?: string;
      current_directory?: string;
      logging_enabled?: boolean;
      logging_filepath?: string;
      openai_api_key?: string;
      openai_chat_model?: string;
      openai_manner?: RewriteMannerType;
      openai_temperature?: number;
    };
    /** FolderEntry */
    FolderEntry: {
      /** @default [] */
      children?: (FileEntry | FolderEntry)[];
      name: string;
      path: string;
    };
    /** HTTPValidationError */
    HTTPValidationError: {
      /** Detail */
      detail?: ValidationError[];
    };
    /** IngestResponse */
    IngestResponse: {
      project_name: string;
      references: Reference[];
    };
    /**
     * IngestStatus
     * @description An enumeration.
     * @enum {string}
     */
    IngestStatus: 'processing' | 'failure' | 'complete';
    /** ProjectCreateRequest */
    ProjectCreateRequest: {
      project_name: string;
      project_path?: string;
    };
    /** ProjectDetailsResponse */
    ProjectDetailsResponse: {
      id: string;
      name: string;
      path: string;
    };
    /** ProjectFileTreeResponse */
    ProjectFileTreeResponse: {
      contents: (FileEntry | FolderEntry)[];
    };
    /**
     * Reference
     * @description A reference for an academic paper / PDF
     */
    Reference: {
      abstract?: string;
      /** @default [] */
      authors?: Author[];
      /** @default [] */
      chunks?: Chunk[];
      citation_key?: string;
      contents?: string;
      doi?: string;
      id: string;
      /** @default {} */
      metadata?: Record<string, never>;
      /** Format: date */
      published_date?: string;
      source_filename: string;
      status: IngestStatus;
      title?: string;
    };
    /**
     * ReferencePatch
     * @description ReferencePatch is the input type for updating a Reference's metadata.
     */
    ReferencePatch: {
      data: Record<string, never>;
    };
    /**
     * ResponseStatus
     * @description An enumeration.
     * @enum {string}
     */
    ResponseStatus: 'ok' | 'error';
    /** RewriteChoice */
    RewriteChoice: {
      index: number;
      text: string;
    };
    /**
     * RewriteMannerType
     * @description An enumeration.
     * @enum {string}
     */
    RewriteMannerType: 'concise' | 'elaborate' | 'scholarly';
    /** RewriteRequest */
    RewriteRequest: {
      /** @default concise */
      manner?: RewriteMannerType;
      /** @default 1 */
      n_choices?: number;
      /** @default 0.7 */
      temperature?: number;
      text: string;
    };
    /** RewriteResponse */
    RewriteResponse: {
      choices: RewriteChoice[];
      message: string;
      status: ResponseStatus;
    };
    /** S2SearchResult */
    S2SearchResult: {
      abstract?: string;
      authors?: string[];
      citationCount?: number;
      openAccessPdf?: string;
      paperId?: string;
      title?: string;
      venue?: string;
      year?: number;
    };
    /** SearchResponse */
    SearchResponse: {
      message: string;
      results: S2SearchResult[];
      status: ResponseStatus;
    };
    /** TextCompletionChoice */
    TextCompletionChoice: {
      index: number;
      text: string;
    };
    /** TextCompletionRequest */
    TextCompletionRequest: {
      abstract?: string;
      /** @default 512 */
      max_tokens?: number;
      /** @default 1 */
      n_choices?: number;
      /** @default 0.7 */
      temperature?: number;
      text: string;
      title?: string;
    };
    /** TextCompletionResponse */
    TextCompletionResponse: {
      choices: TextCompletionChoice[];
      message: string;
      status: ResponseStatus;
    };
    /** UpdateStatusResponse */
    UpdateStatusResponse: {
      message: string;
      status: ResponseStatus;
    };
    /** ValidationError */
    ValidationError: {
      /** Location */
      loc: (string | number)[];
      /** Message */
      msg: string;
      /** Error Type */
      type: string;
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}

export type $defs = Record<string, never>;

export type external = Record<string, never>;

export interface operations {
  /** Http Ai Chat */
  http_ai_chat__project_id__chat_post: {
    parameters: {
      path: {
        project_id: string;
      };
    };
    requestBody: {
      content: {
        'application/json': ChatRequest;
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        content: {
          'application/json': ChatResponse;
        };
      };
      /** @description Validation Error */
      422: {
        content: {
          'application/json': HTTPValidationError;
        };
      };
    };
  };
  /** Http Ai Completion */
  http_ai_completion_completion_post: {
    requestBody: {
      content: {
        'application/json': TextCompletionRequest;
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        content: {
          'application/json': TextCompletionResponse;
        };
      };
      /** @description Validation Error */
      422: {
        content: {
          'application/json': HTTPValidationError;
        };
      };
    };
  };
  /** Http Ai Rewrite */
  http_ai_rewrite_rewrite_post: {
    requestBody: {
      content: {
        'application/json': RewriteRequest;
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        content: {
          'application/json': RewriteResponse;
        };
      };
      /** @description Validation Error */
      422: {
        content: {
          'application/json': HTTPValidationError;
        };
      };
    };
  };
  /** Read File */
  read_file__project_id___filepath__get: {
    parameters: {
      path: {
        project_id: string;
        filepath: string;
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        content: {
          'application/json': unknown;
        };
      };
      /** @description Validation Error */
      422: {
        content: {
          'application/json': HTTPValidationError;
        };
      };
    };
  };
  /** Create File */
  create_file__project_id___filepath__put: {
    parameters: {
      path: {
        project_id: string;
        filepath: string;
      };
    };
    requestBody: {
      content: {
        'multipart/form-data': BodyCreateFile_ProjectId__Filepath_Put;
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        content: {
          'application/json': unknown;
        };
      };
      /** @description Validation Error */
      422: {
        content: {
          'application/json': HTTPValidationError;
        };
      };
    };
  };
  /** Delete File */
  delete_file__project_id___filepath__delete: {
    parameters: {
      path: {
        project_id: string;
        filepath: string;
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        content: {
          'application/json': unknown;
        };
      };
      /** @description Validation Error */
      422: {
        content: {
          'application/json': HTTPValidationError;
        };
      };
    };
  };
  /** Head File */
  head_file__project_id___filepath__head: {
    parameters: {
      path: {
        project_id: string;
        filepath: string;
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        content: {
          'application/json': unknown;
        };
      };
      /** @description Validation Error */
      422: {
        content: {
          'application/json': HTTPValidationError;
        };
      };
    };
  };
  /** Shutdown */
  shutdown_shutdown_post: {
    responses: {
      /** @description Successful Response */
      200: {
        content: {
          'application/json': unknown;
        };
      };
    };
  };
  /** Status */
  status_status_get: {
    responses: {
      /** @description Successful Response */
      200: {
        content: {
          'application/json': unknown;
        };
      };
    };
  };
  /**
   * List Projects
   * @description Returns a list of projects for the current user
   */
  list_projects__get: {
    responses: {
      /** @description Successful Response */
      200: {
        content: {
          'application/json': unknown;
        };
      };
    };
  };
  /**
   * Create Project
   * @description Creates a project, and a directory in the filesystem
   */
  create_project__post: {
    requestBody: {
      content: {
        'application/json': ProjectCreateRequest;
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        content: {
          'application/json': unknown;
        };
      };
      /** @description Validation Error */
      422: {
        content: {
          'application/json': HTTPValidationError;
        };
      };
    };
  };
  /**
   * Get Project
   * @description Returns details about a project
   */
  get_project__project_id__get: {
    parameters: {
      path: {
        project_id: string;
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        content: {
          'application/json': ProjectDetailsResponse;
        };
      };
      /** @description Validation Error */
      422: {
        content: {
          'application/json': HTTPValidationError;
        };
      };
    };
  };
  /**
   * Delete Project
   * @description Deletes a project directory and all files in it
   */
  delete_project__project_id__delete: {
    parameters: {
      path: {
        project_id: string;
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        content: {
          'application/json': unknown;
        };
      };
      /** @description Validation Error */
      422: {
        content: {
          'application/json': HTTPValidationError;
        };
      };
    };
  };
  /** Get Project Files */
  get_project_files__project_id__files_get: {
    parameters: {
      path: {
        project_id: string;
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        content: {
          'application/json': ProjectFileTreeResponse;
        };
      };
      /** @description Validation Error */
      422: {
        content: {
          'application/json': HTTPValidationError;
        };
      };
    };
  };
  /**
   * List References
   * @description Returns a list of references for the current user
   */
  list_references__project_id__get: {
    parameters: {
      path: {
        project_id: string;
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        content: {
          'application/json': Reference[];
        };
      };
      /** @description Validation Error */
      422: {
        content: {
          'application/json': HTTPValidationError;
        };
      };
    };
  };
  /**
   * Ingest References
   * @description Ingests references from PDFs in the project uploads directory
   */
  ingest_references__project_id__post: {
    parameters: {
      path: {
        project_id: string;
      };
    };
    requestBody: {
      content: {
        'application/json': EmptyRequest;
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        content: {
          'application/json': IngestResponse;
        };
      };
      /** @description Validation Error */
      422: {
        content: {
          'application/json': HTTPValidationError;
        };
      };
    };
  };
  /** Http Get */
  http_get__project_id___reference_id__get: {
    parameters: {
      path: {
        project_id: string;
        reference_id: string;
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        content: {
          'application/json': Reference;
        };
      };
      /** @description Validation Error */
      422: {
        content: {
          'application/json': HTTPValidationError;
        };
      };
    };
  };
  /** Http Delete */
  http_delete__project_id___reference_id__delete: {
    parameters: {
      path: {
        project_id: string;
        reference_id: string;
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        content: {
          'application/json': DeleteStatusResponse;
        };
      };
      /** @description Validation Error */
      422: {
        content: {
          'application/json': HTTPValidationError;
        };
      };
    };
  };
  /** Http Update */
  http_update__project_id___reference_id__patch: {
    parameters: {
      path: {
        project_id: string;
        reference_id: string;
      };
    };
    requestBody: {
      content: {
        'application/json': ReferencePatch;
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        content: {
          'application/json': UpdateStatusResponse;
        };
      };
      /** @description Validation Error */
      422: {
        content: {
          'application/json': HTTPValidationError;
        };
      };
    };
  };
  /** Http Bulk Delete */
  http_bulk_delete__project_id__bulk_delete_post: {
    parameters: {
      path: {
        project_id: string;
      };
    };
    requestBody: {
      content: {
        'application/json': DeleteRequest;
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        content: {
          'application/json': DeleteStatusResponse;
        };
      };
      /** @description Validation Error */
      422: {
        content: {
          'application/json': HTTPValidationError;
        };
      };
    };
  };
  /** Http Search S2 */
  http_search_s2_s2_get: {
    parameters: {
      query: {
        query: string;
        limit?: unknown;
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        content: {
          'application/json': SearchResponse;
        };
      };
      /** @description Validation Error */
      422: {
        content: {
          'application/json': HTTPValidationError;
        };
      };
    };
  };
  /** Get Settings */
  get_settings__get: {
    responses: {
      /** @description Successful Response */
      200: {
        content: {
          'application/json': FlatSettingsSchema;
        };
      };
    };
  };
  /** Update Settings */
  update_settings__put: {
    requestBody: {
      content: {
        'application/json': FlatSettingsSchemaPatch;
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        content: {
          'application/json': FlatSettingsSchema;
        };
      };
      /** @description Validation Error */
      422: {
        content: {
          'application/json': HTTPValidationError;
        };
      };
    };
  };
}
