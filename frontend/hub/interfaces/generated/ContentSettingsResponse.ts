// Autogenerated file. Please do not modify.

// If you want to modify fields to interface, create new one in the folder above and create interface with the same name.
// You can then add, modify or even delete existing interface fields. Delete is done with Omit, note however it returns new interface.
// Those autogenerated interfaces does not contains all types, some of them are unknown - those are candidates for custom modification.
// See readme in folder above for more information.

/* eslint-disable @typescript-eslint/no-empty-interface */

// Serializer for information about content-app-settings for the pulp instance
export interface ContentSettingsResponse {
  // The CONTENT_ORIGIN setting for this Pulp instance
  content_origin: string;

  // The CONTENT_PATH_PREFIX setting for this Pulp instance
  content_path_prefix: string;
}