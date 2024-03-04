import React, { Component, ReactElement } from 'react';
import styled from '@emotion/styled';
import { Global, css } from '@emotion/react';
import { colors } from '@atlaskit/theme';
import type {
  DropResult,
  DraggableLocation,
  DroppableProvided,
} from '@hello-pangea/dnd';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import AutoFrame from '@measured/auto-frame-component';
import type { QuoteMap } from '../types';
import { reorderQuoteMap } from '../reorder';
import { PartialAutoScrollerOptions } from '../../../src/state/auto-scroller/fluid-scroller/auto-scroller-options-types';
import QuoteList from '../primatives/quote-list';
import Title from '../primatives/title';
import { grid, borderRadius } from '../constants';

const Column = styled.div`
  margin: ${grid}px;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border-top-left-radius: ${borderRadius}px;
  border-top-right-radius: ${borderRadius}px;
  background-color: ${colors.N30};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${colors.G50};
  }
`;

interface Props {
  initial: QuoteMap;
  withScrollableColumns?: boolean;
  isCombineEnabled?: boolean;
  containerHeight?: string;
  useClone?: boolean;
  applyGlobalStyles?: boolean;
  autoScrollerOptions?: PartialAutoScrollerOptions;
  scale?: number;
}

interface State {
  columns: QuoteMap;
  ordered: string[];
}

export default class IframeBoard extends Component<Props, State> {
  /* eslint-disable react/sort-comp */
  static defaultProps = {
    isCombineEnabled: false,
    applyGlobalStyles: true,
  };

  state: State = {
    columns: this.props.initial,
    ordered: Object.keys(this.props.initial),
  };

  onDragEnd = (result: DropResult): void => {
    // dropped nowhere
    if (!result.destination) {
      return;
    }

    const source: DraggableLocation = result.source;
    const destination: DraggableLocation = result.destination;

    // did not move anywhere - can bail early
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const data = reorderQuoteMap({
      quoteMap: this.state.columns,
      source,
      destination,
    });

    this.setState({
      columns: data.quoteMap,
    });
  };

  render(): ReactElement {
    const columns: QuoteMap = this.state.columns;
    const ordered: string[] = this.state.ordered;

    const board = ordered.map((key: string, index: number) => (
      <AutoFrame
        key={key}
        style={{
          width: 282, // Magic number based on size of board
          height: this.props.scale ? `${100 / this.props.scale}vh` : '100vh',
          border: 0,
          transform: this.props.scale
            ? `scale(${this.props.scale})`
            : undefined,
          transformOrigin: this.props.scale ? 'top' : undefined,
        }}
      >
        <Droppable
          droppableId={`board-iframe-${index}`}
          type="COLUMN"
          direction="horizontal"
        >
          {(provided: DroppableProvided) => (
            <Column ref={provided.innerRef} {...provided.droppableProps}>
              <Header>
                <Title aria-label={`${key} quote list`}>
                  {key} (iframe {index})
                </Title>
              </Header>
              <QuoteList listId={key} listType="QUOTE" quotes={columns[key]} />
              {provided.placeholder}
            </Column>
          )}
        </Droppable>
      </AutoFrame>
    ));

    return (
      <React.Fragment>
        <DragDropContext
          onDragEnd={this.onDragEnd}
          autoScrollerOptions={this.props.autoScrollerOptions}
        >
          <div style={{ display: 'flex' }}>{board}</div>
        </DragDropContext>
        <Global
          styles={css`
            body {
              background: ${colors.B200};
            }
          `}
        />
      </React.Fragment>
    );
  }
}
