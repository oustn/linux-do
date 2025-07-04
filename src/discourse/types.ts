import { ApiResponse } from '@src/discourse/abstract-client.ts';
import { paths } from '@src/discourse/schema';

export type TopicDetail = NonNullable<Awaited<ApiResponse<paths, 'get', '/t/{id}.json'>>>

export type PostDetail = NonNullable<Awaited<ApiResponse<paths, 'get', '/posts/{id}.json'>>> & {
  current_user_reaction: {
    can_undo: boolean;
    id: string;
    type: string;
  }
  reactions: Array<{
    count: number;
    id: string;
    type: string;
  }>
}

export type Reaction = 'heart' | '+1' | 'laughing' | 'open_mouth' | 'clap' | 'confetti_ball' | 'hugs' |  'tieba_087'
