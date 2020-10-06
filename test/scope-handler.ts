// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {describe, it, before} from 'mocha';
import {setup} from './util';
import {partitionSuggestedHunksByScope} from '../src/github-handler/comment-handler/get-hunk-scope-handler/scope-handler';
import {expect} from 'chai';
import {Hunk} from '../src/types';

before(() => {
  setup();
});

describe('partitionSuggestedHunksByScope', () => {
  it('allows multiple suggestions in a single hunk', () => {
    const prHunk = {
      oldStart: 10,
      oldEnd: 20,
      newStart: 10,
      newEnd: 20,
      newContent: [],
    };
    const pullRequestHunks: Map<string, Hunk[]> = new Map();
    pullRequestHunks.set('file1.txt', [prHunk]);

    const hunk1 = {
      oldStart: 10,
      oldEnd: 12,
      newStart: 10,
      newEnd: 12,
      newContent: [],
    };
    const hunk2 = {
      oldStart: 15,
      oldEnd: 15,
      newStart: 20,
      newEnd: 20,
      newContent: [],
    };
    const suggestedHunks: Map<string, Hunk[]> = new Map();
    suggestedHunks.set('file1.txt', [hunk1, hunk2]);

    const {validHunks, invalidHunks} = partitionSuggestedHunksByScope(
      pullRequestHunks,
      suggestedHunks
    );
    expect(validHunks.get('file1.txt')!.length).to.equal(2);
    expect(validHunks.get('file1.txt')).to.eql([hunk1, hunk2]);
    expect(invalidHunks.size).to.equal(0);
  });

  it('allows multiple suggestions in a second hunk', () => {
    const prHunk1 = {
      oldStart: 10,
      oldEnd: 20,
      newStart: 10,
      newEnd: 20,
      newContent: [],
    };
    const prHunk2 = {
      oldStart: 30,
      oldEnd: 40,
      newStart: 30,
      newEnd: 40,
      newContent: [],
    };
    const pullRequestHunks: Map<string, Hunk[]> = new Map();
    pullRequestHunks.set('file1.txt', [prHunk1, prHunk2]);

    const hunk1 = {
      oldStart: 32,
      oldEnd: 35,
      newStart: 32,
      newEnd: 35,
      newContent: [],
    };
    const suggestedHunks: Map<string, Hunk[]> = new Map();
    suggestedHunks.set('file1.txt', [hunk1]);

    const {validHunks, invalidHunks} = partitionSuggestedHunksByScope(
      pullRequestHunks,
      suggestedHunks
    );
    expect(validHunks.get('file1.txt')!.length).to.equal(1);
    expect(validHunks.get('file1.txt')).to.eql([hunk1]);
    expect(invalidHunks.size).to.equal(0);
  });

  it('disallows hunk not included in range', () => {
    const prHunk = {
      oldStart: 10,
      oldEnd: 20,
      newStart: 10,
      newEnd: 20,
      newContent: ['original'],
    };
    const pullRequestHunks: Map<string, Hunk[]> = new Map();
    pullRequestHunks.set('file1.txt', [prHunk]);

    const hunk1 = {
      oldStart: 5,
      oldEnd: 12,
      newStart: 5,
      newEnd: 12,
      newContent: ['hunk1'],
    };
    const hunk2 = {
      oldStart: 15,
      oldEnd: 25,
      newStart: 15,
      newEnd: 25,
      newContent: ['hunk2'],
    };
    const suggestedHunks: Map<string, Hunk[]> = new Map();
    suggestedHunks.set('file1.txt', [hunk1, hunk2]);

    const {validHunks, invalidHunks} = partitionSuggestedHunksByScope(
      pullRequestHunks,
      suggestedHunks
    );
    expect(validHunks.size).to.equal(0);
    expect(invalidHunks.get('file1.txt')!.length).to.equal(2);
    expect(invalidHunks.get('file1.txt')).to.eql([hunk1, hunk2]);
  });

  it('disallows files not included in valid files', () => {
    const pullRequestHunks: Map<string, Hunk[]> = new Map();
    pullRequestHunks.set('file1.txt', []);

    const hunk1 = {
      oldStart: 1,
      oldEnd: 1,
      newStart: 1,
      newEnd: 1,
      newContent: [],
    };
    const suggestedHunks: Map<string, Hunk[]> = new Map();
    suggestedHunks.set('file2.txt', [hunk1]);

    const {validHunks, invalidHunks} = partitionSuggestedHunksByScope(
      pullRequestHunks,
      suggestedHunks
    );
    expect(validHunks.size).to.equal(0);
    expect(invalidHunks.get('file2.txt')!.length).to.equal(1);
    expect(invalidHunks.get('file2.txt')).to.eql([hunk1]);
  });
});
