import {paths as openapi} from './openapi'

export interface paths extends openapi {
  "/about.json": {
    get: operations["getAbout"];
  };

  "/u/{username}/summary.json": {
    get: operations["getUserSummary"];
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
          }
        }
      }
    }
  }
}
