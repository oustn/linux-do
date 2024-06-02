export class DiscourseError extends Error {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  constructor(message: string, private readonly response?: Response) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class UnauthenticatedError extends DiscourseError {
  constructor(response: Response) {
    super('Unauthenticated', response);
  }
}

export class NotFoundError extends DiscourseError {
  constructor(response: Response) {
    super('Not found', response);
  }
}

export class UnprocessableEntityError extends DiscourseError {
  constructor(response: Response) {
    super('Unprocessable entity', response);
  }
}

export class TooManyRequests extends DiscourseError {
  constructor(response: Response) {
    super('Too many requests', response);
  }
}

export class TimeoutError extends DiscourseError {
  constructor() {
    super('Timeout');
  }
}
