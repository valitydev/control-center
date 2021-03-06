import {
    Commit,
    InsertOp,
    Operation,
    RemoveOp,
    UpdateOp,
} from '@vality/domain-proto/lib/domain_config';
import * as DomainConfigTypes from '@vality/domain-proto/lib/domain_config/gen-nodejs/domain_config_types';

/**
 * @deprecated use createDamselInstance
 */
const toGenInsertOp = (insertOp: InsertOp) => {
    const insertOpGen = new DomainConfigTypes.InsertOp();
    insertOpGen.object = insertOp.object;
    return insertOpGen;
};

/**
 * @deprecated use createDamselInstance
 */
const toGenUpdateOp = (updateOp: UpdateOp) => {
    const updateOpGen = new DomainConfigTypes.UpdateOp();
    updateOpGen.old_object = updateOp.old_object;
    updateOpGen.new_object = updateOp.new_object;
    return updateOpGen;
};

/**
 * @deprecated use createDamselInstance
 */
const toGenRemoveOp = (removeOp: RemoveOp) => {
    const removeOpGen = new DomainConfigTypes.RemoveOp();
    removeOpGen.object = removeOp.object;
    return removeOpGen;
};

/**
 * @deprecated use createDamselInstance
 */
const toGenOperation = (operation: Operation) => {
    const operationGen = new DomainConfigTypes.Operation();
    if (operation.insert) {
        operationGen.insert = toGenInsertOp(operation.insert);
    } else if (operation.update) {
        operationGen.update = toGenUpdateOp(operation.update);
    } else if (operation.remove) {
        operationGen.remove = toGenRemoveOp(operation.remove);
    }
    return operationGen;
};

/**
 * @deprecated use createDamselInstance
 */
const toGenCommitOps = (operations: Operation[]) =>
    operations.map((operation) => toGenOperation(operation));

/**
 * @deprecated use createDamselInstance
 */
export const toGenCommit = (commit: Commit) => {
    const genCommit = new DomainConfigTypes.Commit();
    genCommit.ops = toGenCommitOps(commit.ops);
    return genCommit;
};
