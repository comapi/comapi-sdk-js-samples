import { ComapiChatPage } from './app.po';

describe('comapi-chat App', () => {
  let page: ComapiChatPage;

  beforeEach(() => {
    page = new ComapiChatPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Comapi Chat');
  });
});
