import { PrettyDatePipe } from './pretty-date.pipe';

describe('PrettyDatePipe', () => {
  it('create an instance', () => {
    const pipe = new PrettyDatePipe();
    expect(pipe).toBeTruthy();
    expect(pipe.transform(new Date().toISOString())).toBe("just now");
  });
});
