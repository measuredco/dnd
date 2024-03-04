import React from 'react';
import { storiesOf } from '@storybook/react';
import IframeBoard from '../src/board/iframe-board';
import { authorQuoteMap } from '../src/data';

storiesOf('Examples/iframe', module)
  .add('simple', () => (
    <IframeBoard
      initial={Object.keys(authorQuoteMap).reduce(
        (acc, author) => ({
          ...acc,
          [author]: authorQuoteMap[author].map((quote) => ({
            ...quote,
            author: { ...quote.author, url: '' },
          })),
        }),
        {},
      )}
    />
  ))
  .add('transformed', () => (
    <IframeBoard
      scale={0.75}
      initial={Object.keys(authorQuoteMap).reduce(
        (acc, author) => ({
          ...acc,
          [author]: authorQuoteMap[author].map((quote) => ({
            ...quote,
            author: { ...quote.author, url: '' },
          })),
        }),
        {},
      )}
    />
  ));
