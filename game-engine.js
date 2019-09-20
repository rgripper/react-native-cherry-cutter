import { interval, merge, Subject } from 'rxjs';
import { scan, map, take, takeWhile } from 'rxjs/operators';
export function createGame({ onChange, cutter, generator }) {
    const itemWidth = 10;
    const randomItemLeft = () => Math.round(Math.random() * (100 - itemWidth));
    const initialState = {
        items: [],
        isFinished: false,
        cutter,
        direction: null
    };
    const calcInterval = 100;
    const stateCalc$ = interval(calcInterval);
    const directions$ = new Subject();
    const newItemEvents$ = interval(generator.interval).pipe(map(id => ({ newItem: { id, left: randomItemLeft(), top: 0, width: itemWidth, isCut: false, isMissed: false } })), take(generator.maxItems));
    const directionEvents$ = directions$.pipe(map(direction => ({ direction })));
    const timeDeltaEvents$ = stateCalc$.pipe(map(() => ({ delta: calcInterval })));
    const events$ = merge(newItemEvents$, directionEvents$, timeDeltaEvents$);
    const _reduceGameState = (prevState, event) => reduceGameState(prevState, event, generator.maxItems);
    const mainSubscription = events$
        .pipe(scan(_reduceGameState, initialState), takeWhile(state => !state.isFinished, true))
        .subscribe(onChange);
    return {
        setDirection: (direction) => directions$.next(direction),
        stop: () => {
            mainSubscription.unsubscribe();
        }
    };
}
function reduceGameState(prevState, event, maxItems) {
    const { newItem, direction, delta } = event;
    if (newItem !== undefined) {
        return Object.assign(Object.assign({}, prevState), { items: [newItem, ...prevState.items] });
    }
    if (direction !== undefined) {
        return Object.assign(Object.assign({}, prevState), { direction });
    }
    if (delta !== undefined) {
        const itemSpeed = 0.025; // percents per millisecond
        const cutterSpeed = 0.030; // percents per millisecond
        const reduceItemState = (item) => {
            if (isItemGone(item))
                return item;
            const top = item.top + itemSpeed * delta;
            const isCut = itemIntersectsCutter(item, prevState.cutter);
            return (Object.assign(Object.assign({}, item), { top, isCut, isMissed: item.top >= 100 }));
        };
        const updatedItems = prevState.items.map(reduceItemState);
        const cutterSpeedDirected = prevState.direction === 'left' ? -cutterSpeed : prevState.direction === 'right' ? cutterSpeed : 0;
        const cutterLeft = Math.max(Math.min(prevState.cutter.left + cutterSpeedDirected * delta, 100 - prevState.cutter.width), 0);
        return Object.assign(Object.assign({}, prevState), { items: updatedItems, isFinished: isGameFinished(updatedItems, maxItems), cutter: Object.assign(Object.assign({}, prevState.cutter), { left: cutterLeft }) });
    }
    throw new Error('Must not fall here: event was empty?');
}
function isGameFinished(items, maxItems) {
    return items.length === maxItems && items.every(isItemGone);
}
function isItemGone(item) {
    return item.isCut || item.isMissed;
}
function itemIntersectsCutter(item, cutter) {
    return (item.top + 5) > cutter.top && intersect({ left: item.left, right: item.left + item.width }, { left: cutter.left, right: cutter.left + cutter.width });
}
function intersect(a, b) {
    return Math.max(a.left, b.left) < Math.min(a.right, b.right);
}
