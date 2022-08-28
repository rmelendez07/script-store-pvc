import * as k8s from '@kubernetes/client-node'

interface PVCInformation {
    userId: string,
    projectId: string,
}

export const getPVCListFromNamespace = async (): Promise<k8s.V1PersistentVolumeClaim[]>  => {
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();
    const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
    const res = await k8sApi.listNamespacedPersistentVolumeClaim(process.env.AKS_PVC_NAMESPACE)    
    
    return res.body.items
}

export const getUserIdProjectIdFromPVC = (pvcList: k8s.V1PersistentVolumeClaim[], pvcName: string): PVCInformation => {
    const test = pvcList.find(e => `pvc-${e.metadata.uid}` === pvcName)
    
    const projectId = test.metadata.name.match(/(\d+)(?!.*\d)/)[0];
    const userId = test.metadata.name.match(/((.*)\-)+/)[0]

    return {
      projectId,
      userId: userId.substring(0, userId.length - 1),
    }
}