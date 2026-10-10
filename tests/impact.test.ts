import {test} from 'node:test';import assert from 'node:assert/strict';
import {oethScenario,reuseScenario} from '../src/lib/impact';
test('OETH uses eligible labor and remaining shared cap, including zero contribution',()=>{
  assert.equal(oethScenario({eligibleLabor:5000,contribution:4000,employmentRate:1.5,otherDeductions:1200}).deduction,800);
  assert.equal(oethScenario({eligibleLabor:5000,contribution:4000,employmentRate:3,otherDeductions:1200}).deduction,1500);
  assert.equal(oethScenario({eligibleLabor:5000,contribution:0,employmentRate:3,otherDeductions:0}).deduction,0);
  assert.equal(oethScenario({eligibleLabor:5000,contribution:4000,employmentRate:1,otherDeductions:3000}).deduction,0);
  assert.throws(()=>oethScenario({eligibleLabor:-1,contribution:4000,employmentRate:1,otherDeductions:0}));
});
test('reuse scenario shows average use, without claiming measured carbon savings',()=>{assert.equal(reuseScenario(50000,200000).averageRotations,4);assert.equal(reuseScenario(0,0).averageRotations,0);});
