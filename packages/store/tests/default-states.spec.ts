import { Action, NgxsModule, State, StateContext, Store } from '../src/public_api';
import { TestBed } from '@angular/core/testing';

describe('Reusable States', () => {
  let store: Store;

  class UpdateFoo {
    static readonly type = '[update] foo';
    constructor(public payload: number) {}
  }

  @State<number[]>({
    name: 'foo',
    defaults: [1, 2, 3]
  })
  class FooState {
    @Action(UpdateFoo)
    public update(ctx: StateContext<number[]>, { payload }: UpdateFoo) {
      ctx.setState([...ctx.getState(), payload]);
    }
  }

  it('should not overwrite an already existing state (hmr or any setup)', () => {
    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([FooState], {
          defaultsState: {
            foo: [4, 5, 6]
          }
        })
      ]
    });

    store = TestBed.get(Store);

    let stateValue = store.selectSnapshot(FooState);
    expect(stateValue).toEqual([4, 5, 6]);

    store.dispatch(new UpdateFoo(7));
    stateValue = store.selectSnapshot(FooState);
    expect(stateValue).toEqual([4, 5, 6, 7]);
  });

  it('should be correct readonly state', () => {
    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([FooState], {
          defaultsState: {
            // there is no possibility to overwrite it
            // if we don't use the state class
            // this is convenient if we need to initiate
            // the static configuration before calling the module
            configState: { a: 1, b: 2 }
          }
        })
      ]
    });

    store = TestBed.get(Store);

    expect(store.snapshot()).toEqual({
      configState: { a: 1, b: 2 },
      foo: [1, 2, 3]
    });

    const readonlyState = store.selectSnapshot((state: any) => state.configState);
    expect(readonlyState).toEqual({ a: 1, b: 2 });
  });
});
