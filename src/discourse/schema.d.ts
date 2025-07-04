import {paths as openapi} from './openapi'
import { PostDetail } from '@src/discourse/types.ts';

export interface paths extends openapi {
  "/about.json": {
    get: operations["getAbout"];
  };

  "/u/{username}/summary.json": {
    get: operations["getUserSummary"];
  };

  "/topics/timings": {
    post: operations["timings"];
  };

  "/discourse-reactions/posts/{id}/custom-reactions/{reaction}/toggle.json": {
    put: operations["toggleLike"];
  }
}

interface operations {
  getAbout: {
    responses: {
      /** @description success response */
      200: {
        content: {
          "application/json": {
            "about": {
              "stats": {
                "topics_last_day": number;
              }
            }
          }
        }
      }
    }
  }
  getUserSummary: {
    parameters: {
      path: {
        username: string;
      }
    }
    responses: {
      200: {
        content: {
          "application/json": {
            user_summary: {
              topics_entered: number;
              topic_count: number;
              time_read: number;
              solved_count: number;
              recent_time_read: number;
              posts_read_count: number;
              post_count: number;
              likes_received: number;
              likes_given: number;
              days_visited: number;
              bookmark_count: number;
            }
            users: Array<{
              avatar_template: string;
              name: string
              username: string
            }>
          }
        }
      }
    }
  },
  timings: {
    requestBody?: {
      content: {
        "application/json": {
          timings: Record<string, number>
          topic_time: number | string;
          topic_id: number | string
        };
      };
    };
    responses: {
      /** @description success response */
      200: {
        content: {
          "application/json": {
            "about": {
              "stats": {
                "topics_last_day": number;
              }
            }
          }
        }
      }
    }
  },

  toggleLike: {
    parameters: {
      path: {
        id: string;
        reaction: string;
      }
    },
    responses: {
      /** @description success response */
      200: {
        content: {
          "application/json": PostDetail
        }
      }
    }
  },
}
