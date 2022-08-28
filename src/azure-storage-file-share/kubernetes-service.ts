import * as k8s from '@kubernetes/client-node'

interface PVCInformation {
    userId?: string,
    projectId?: string,
    pvcFound: boolean,
}

export const getPVCListFromNamespace = async (): Promise<k8s.V1PersistentVolumeClaim[]>  => {
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();
    const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
    // Read the README.md file to know the value of this env variable AKS_PVC_NAMESPACE
    const res = await k8sApi.listNamespacedPersistentVolumeClaim(process.env.AKS_PVC_NAMESPACE)    
    
    return res.body.items
}

export const getUserIdProjectIdFromPVC = (pvcList: k8s.V1PersistentVolumeClaim[], pvcName: string): PVCInformation => {
    const test = pvcList.find(e => `pvc-${e.metadata.uid}` === pvcName)
    
    if(!test) return { pvcFound: false }

    const projectId = test.metadata.name.match(/(\d+)(?!.*\d)/)[0];
    const userId = test.metadata.name.match(/((.*)\-)+/)[0]

    return {
      projectId,
      userId: userId.substring(0, userId.length - 1),
      pvcFound: true
    }
}
