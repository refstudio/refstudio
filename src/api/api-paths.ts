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
  HTTPValidationError,
  IngestStatus,
  LoggingSettings,
  OpenAISettings,
  ProjectSettings,
  Reference,
  ReferencePatch,
  ResponseStatus,
  RewriteChoice,
  RewriteMannerType,
  RewriteRequest,
  RewriteResponse,
  S2SearchResult,
  SearchRequest,
  SearchResponse,
  SettingsSchema,
  SidecarSettings,
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
  '/api/sidecar/rewrite': {
    /** Http Rewrite */
    post: operations['http_rewrite_rewrite_post'];
  };
  '/api/sidecar/completion': {
    /** Http Completion */
    post: operations['http_completion_completion_post'];
  };
  '/api/sidecar/chat': {
    /** Http Chat */
    post: operations['http_chat_chat_post'];
  };
  '/api/sidecar/search': {
    /** Http Search */
    post: operations['http_search_search_post'];
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
  '/api/ai/rewrite': {
    /** Http Ai Rewrite */
    post: operations['http_ai_rewrite_rewrite_post'];
  };
  '/api/ai/completion': {
    /** Http Ai Completion */
    post: operations['http_ai_completion_completion_post'];
  };
  '/api/ai/{project_id}/chat': {
    /** Http Ai Chat */
    post: operations['http_ai_chat__project_id__chat_post'];
  };
  '/api/search/s2': {
    /** Http Search S2 */
    post: operations['http_search_s2_s2_post'];
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
  '/api/projects/': {
    /**
     * List Projects
     * @description Returns a list of projects for the current user
     */
    get: operations['list_projects__get'];
    /**
     * Create Project
     * @description Creates a project directory in the filesystem
     *
     * Parameters
     * ----------
     * project_name : str
     *     The name of the project
     * project_path : str
     *     The path to the project directory. Only necessary for Desktop.
     *     For web, the project is stored in a private directory on the server.
     */
    post: operations['create_project__post'];
  };
  '/api/projects/{project_id}': {
    /**
     * Get Project
     * @description Returns the project path and a list of files in the project
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
  '/api/meta/status': {
    /** Status */
    get: operations['status_status_get'];
  };
  '/api/meta/shutdown': {
    /** Shutdown */
    post: operations['shutdown_shutdown_post'];
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
    /** ChatRequest */
    ChatRequest: {
      text: string;
      /** @default 1 */
      n_choices?: number;
      /** @default 0.7 */
      temperature?: number;
    };
    /** ChatResponse */
    ChatResponse: {
      status: ResponseStatus;
      message: string;
      choices: ChatResponseChoice[];
    };
    /** ChatResponseChoice */
    ChatResponseChoice: {
      index: number;
      text: string;
    };
    /** HTTPValidationError */
    HTTPValidationError: {
      /** Detail */
      detail?: ValidationError[];
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
      text: string;
      /** @default concise */
      manner?: RewriteMannerType;
      /** @default 1 */
      n_choices?: number;
      /** @default 0.7 */
      temperature?: number;
    };
    /** RewriteResponse */
    RewriteResponse: {
      status: ResponseStatus;
      message: string;
      choices: RewriteChoice[];
    };
    /** S2SearchResult */
    S2SearchResult: {
      title?: string;
      abstract?: string;
      venue?: string;
      year?: number;
      paperId?: string;
      citationCount?: number;
      openAccessPdf?: string;
      authors?: string[];
    };
    /** SearchRequest */
    SearchRequest: {
      query: string;
      /** @default 10 */
      limit?: number;
    };
    /** SearchResponse */
    SearchResponse: {
      status: ResponseStatus;
      message: string;
      results: S2SearchResult[];
    };
    /** TextCompletionChoice */
    TextCompletionChoice: {
      index: number;
      text: string;
    };
    /** TextCompletionRequest */
    TextCompletionRequest: {
      text: string;
      /** @default 1 */
      n_choices?: number;
      /** @default 0.7 */
      temperature?: number;
      /** @default 512 */
      max_tokens?: number;
      title?: string;
      abstract?: string;
    };
    /** TextCompletionResponse */
    TextCompletionResponse: {
      status: ResponseStatus;
      message: string;
      choices: TextCompletionChoice[];
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
    /** Author */
    Author: {
      full_name: string;
      given_name?: string;
      surname?: string;
      email?: string;
    };
    /** Chunk */
    Chunk: {
      text: string;
      /** @default [] */
      vector?: number[];
      /** @default {} */
      metadata?: Record<string, never>;
    };
    /** DeleteRequest */
    DeleteRequest: {
      reference_ids: string[];
      /** @default false */
      all?: boolean;
    };
    /** DeleteStatusResponse */
    DeleteStatusResponse: {
      status: ResponseStatus;
      message: string;
    };
    /**
     * IngestStatus
     * @description An enumeration.
     * @enum {string}
     */
    IngestStatus: 'processing' | 'failure' | 'complete';
    /**
     * Reference
     * @description A reference for an academic paper / PDF
     */
    Reference: {
      id: string;
      source_filename: string;
      status: IngestStatus;
      citation_key?: string;
      doi?: string;
      title?: string;
      abstract?: string;
      contents?: string;
      /** Format: date */
      published_date?: string;
      /** @default [] */
      authors?: Author[];
      /** @default [] */
      chunks?: Chunk[];
      /** @default {} */
      metadata?: Record<string, never>;
    };
    /**
     * ReferencePatch
     * @description ReferencePatch is the input type for updating a Reference's metadata.
     */
    ReferencePatch: {
      data: Record<string, never>;
    };
    /** UpdateStatusResponse */
    UpdateStatusResponse: {
      status: ResponseStatus;
      message: string;
    };
    /** Body_create_file__project_id___filepath__put */
    Body_create_file__project_id___filepath__put: {
      /**
       * File
       * Format: binary
       */
      file: string;
    };
    /** LoggingSettings */
    LoggingSettings: {
      /** @default false */
      enable?: boolean;
      /** @default /tmp/refstudio-sidecar.log */
      filepath?: string;
    };
    /** OpenAISettings */
    OpenAISettings: {
      /** @default */
      api_key?: string;
      /** @default gpt-3.5-turbo */
      chat_model?: string;
      /** @default scholarly */
      manner?: RewriteMannerType;
      /** @default 0.7 */
      temperature?: number;
    };
    /** ProjectSettings */
    ProjectSettings: {
      /** @default */
      current_directory?: string;
    };
    /** SettingsSchema */
    SettingsSchema: {
      /**
       * @default {
       *   "current_directory": ""
       * }
       */
      project?: ProjectSettings;
      /**
       * @default {
       *   "api_key": "",
       *   "chat_model": "gpt-3.5-turbo",
       *   "manner": "scholarly",
       *   "temperature": 0.7
       * }
       */
      openai?: OpenAISettings;
      /**
       * @default {
       *   "logging": {
       *     "enable": false,
       *     "filepath": "/tmp/refstudio-sidecar.log"
       *   }
       * }
       */
      sidecar?: SidecarSettings;
    };
    /** SidecarSettings */
    SidecarSettings: {
      /**
       * @default {
       *   "enable": false,
       *   "filepath": "/tmp/refstudio-sidecar.log"
       * }
       */
      logging?: LoggingSettings;
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
  /** Http Rewrite */
  http_rewrite_rewrite_post: {
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
  /** Http Completion */
  http_completion_completion_post: {
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
  /** Http Chat */
  http_chat_chat_post: {
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
  /** Http Search */
  http_search_search_post: {
    requestBody: {
      content: {
        'application/json': SearchRequest;
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
  /** Http Search S2 */
  http_search_s2_s2_post: {
    requestBody: {
      content: {
        'application/json': SearchRequest;
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
   * @description Creates a project directory in the filesystem
   *
   * Parameters
   * ----------
   * project_name : str
   *     The name of the project
   * project_path : str
   *     The path to the project directory. Only necessary for Desktop.
   *     For web, the project is stored in a private directory on the server.
   */
  create_project__post: {
    parameters: {
      query: {
        project_name: string;
        project_path?: string;
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
   * @description Returns the project path and a list of files in the project
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
  /** Get Settings */
  get_settings__get: {
    responses: {
      /** @description Successful Response */
      200: {
        content: {
          'application/json': SettingsSchema;
        };
      };
    };
  };
  /** Update Settings */
  update_settings__put: {
    requestBody: {
      content: {
        'application/json': SettingsSchema;
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        content: {
          'application/json': SettingsSchema;
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
