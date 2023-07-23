import * as t from '@babel/types';
import { AsyncTransform } from '../transforms';
import { VMDecoder } from './vm';

/**
 * Replaces calls to decoder functions with the decoded string.
 * E.g. `m(199)` -> `'log'`
 */
export default {
  name: 'inlineDecodedStrings',
  tags: ['unsafe'],
  async run(ast, state, options) {
    if (!options) return;

    const calls = options.vm.decoders.flatMap(decoder =>
      decoder.collectCalls()
    );
    const decodedValues = await options.vm.decode(calls);

    for (let i = 0; i < calls.length; i++) {
      const call = calls[i];
      const value = decodedValues[i];

      call.replaceWith(t.valueToNode(value));
      if (typeof value !== 'string')
        call.addComment('leading', 'webcrack:decode_error');
    }

    state.changes += calls.length;
  },
} satisfies AsyncTransform<{ vm: VMDecoder }>;
